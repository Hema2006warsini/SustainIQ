import { Pool, PoolClient, QueryResult } from 'pg';
import path from 'path';

// Optional embedded PostgreSQL engine for zero-dependency standalone local run
let embeddedPgInstance: any = null;
let isEmbeddedRunning = false;

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/sustainiq';

let pool: Pool | null = null;
let isConnected = false;

async function startEmbeddedIfLocal(targetUrlStr: string): Promise<void> {
  const isLocalhost = targetUrlStr.includes('localhost') || targetUrlStr.includes('127.0.0.1');
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isLocalhost || isProduction) {
    return;
  }

  // Quick check if PostgreSQL is already running on the target port
  try {
    const url = new URL(targetUrlStr);
    const testPool = new Pool({
      connectionString: targetUrlStr,
      connectionTimeoutMillis: 1000,
    });
    const client = await testPool.connect();
    client.release();
    await testPool.end();
    // Already running!
    return;
  } catch (err: any) {
    // Port not open or db not initialized; launch embedded engine
    console.log('ℹ️  Local PostgreSQL service not detected on localhost port. Initializing Embedded PostgreSQL...');
  }

  try {
    // Dynamic require so production containers do not require embedded-postgres binaries
    const EmbeddedPostgres = require('embedded-postgres').default || require('embedded-postgres');
    const url = new URL(targetUrlStr);
    const port = Number(url.port) || 5432;
    const user = decodeURIComponent(url.username || 'postgres');
    const password = decodeURIComponent(url.password || 'postgrespassword');
    const dataDir = path.resolve(__dirname, '../../data/db');

    embeddedPgInstance = new EmbeddedPostgres({
      port,
      user,
      password,
      databaseDir: dataDir,
      persistent: true,
    });

    await embeddedPgInstance.start();
    isEmbeddedRunning = true;
    console.log(`✅ Embedded PostgreSQL engine active on port ${port} (Data directory: ${dataDir})`);
  } catch (err: any) {
    console.warn(`⚠️ Embedded PostgreSQL initialization warning: ${err.message}`);
  }
}

async function ensureTargetDatabase(targetUrlStr: string): Promise<void> {
  try {
    const url = new URL(targetUrlStr);
    const targetDb = url.pathname.replace(/^\//, '') || 'sustainiq';

    // Connect to maintenance database 'postgres' first to verify/create target database
    url.pathname = '/postgres';
    const maintenancePool = new Pool({
      connectionString: url.toString(),
      connectionTimeoutMillis: 3000,
    });

    try {
      const client = await maintenancePool.connect();
      try {
        const checkRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
        if (checkRes.rowCount === 0) {
          console.log(`📦 Creating PostgreSQL database "${targetDb}"...`);
          await client.query(`CREATE DATABASE "${targetDb}"`);
          console.log(`✅ PostgreSQL database "${targetDb}" ready.`);
        }
      } finally {
        client.release();
      }
    } finally {
      await maintenancePool.end().catch(() => {});
    }
  } catch (err: any) {
    // If maintenance database is not accessible, assume target db already exists or credentials restrict access
  }
}

export async function initDatabase(): Promise<void> {
  try {
    const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    const isProduction = process.env.NODE_ENV === 'production';

    if (isLocalhost && !isProduction) {
      await startEmbeddedIfLocal(databaseUrl);
      await ensureTargetDatabase(databaseUrl);
    }

    pool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 10000,
      max: 20,
      idleTimeoutMillis: 30000,
      ssl: !isLocalhost || isProduction ? { rejectUnauthorized: false } : undefined,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });

    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully at', databaseUrl.replace(/:[^:@]+@/, ':****@'));

    // Execute schema migrations with full relational integrity and user isolation
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        reporting_year INTEGER NOT NULL,
        custom_metrics_schema JSONB DEFAULT '{}'::jsonb,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations (owner_id);

      CREATE TABLE IF NOT EXISTS esg_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        record_date DATE NOT NULL,
        energy_consumption NUMERIC(12, 2) NOT NULL,
        water_consumption NUMERIC(12, 2) NOT NULL,
        waste_generated NUMERIC(12, 2) NOT NULL,
        waste_recycled NUMERIC(12, 2) NOT NULL,
        carbon_emissions NUMERIC(12, 2) NOT NULL,
        renewable_energy_percentage NUMERIC(5, 2) NOT NULL,
        employees INTEGER NOT NULL,
        training_hours NUMERIC(10, 2) NOT NULL,
        safety_incidents INTEGER NOT NULL,
        community_initiatives INTEGER NOT NULL,
        compliance_percentage NUMERIC(5, 2) NOT NULL,
        ethics_incidents INTEGER NOT NULL,
        governance_score NUMERIC(5, 2) NOT NULL,
        environmental_score NUMERIC(5, 2),
        social_score NUMERIC(5, 2),
        governance_score_calculated NUMERIC(5, 2),
        overall_esg_score NUMERIC(5, 2),
        custom_metrics JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_esg_records_org_date ON esg_records (organization_id, record_date DESC);
    `);

    // Safe migration: Ensure owner_id column exists on organizations table if migrated from older version
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'organizations' AND column_name = 'owner_id'
        ) THEN
          ALTER TABLE organizations ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE CASCADE;
          CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations (owner_id);
        END IF;
      END $$;
    `);

    client.release();
    isConnected = true;
    console.log('✅ PostgreSQL Schema verified: users, organizations & esg_records tables ready. ZERO mock data policy active.');
  } catch (error: any) {
    isConnected = false;
    console.error('❌ PostgreSQL connection failed:', error.message);
    throw error;
  }
}

export async function query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initDatabase() first.');
  }
  const res: QueryResult = await pool.query(text, params);
  return { rows: res.rows, rowCount: res.rowCount || 0 };
}

export async function getClient(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initDatabase() first.');
  }
  return pool.connect();
}

export function getDatabaseStatus(): {
  type: string;
  connected: boolean;
  database: string;
  host: string;
} {
  let host = 'localhost';
  let database = 'sustainiq';
  try {
    const url = new URL(databaseUrl);
    host = url.host;
    database = url.pathname.replace(/^\//, '') || 'sustainiq';
  } catch {
    // keep defaults
  }

  return {
    type: isEmbeddedRunning ? 'PostgreSQL (Embedded Standalone)' : 'PostgreSQL',
    connected: isConnected,
    database,
    host,
  };
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (embeddedPgInstance && isEmbeddedRunning) {
    await embeddedPgInstance.stop();
    isEmbeddedRunning = false;
  }
  isConnected = false;
}
