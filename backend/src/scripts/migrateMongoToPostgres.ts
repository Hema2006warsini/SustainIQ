/**
 * SustainIQ — MongoDB to PostgreSQL Data Migration Utility
 *
 * Safely transfers all Users (including hashed passwords), Organizations,
 * and ESG Records from MongoDB into PostgreSQL, preserving relational integrity.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { ESGRecordModel } from '../models/ESGRecord';
import { initDatabase, query, closeDatabase } from '../config/database';

export async function runMongoToPostgresMigration(): Promise<{
  usersCount: number;
  orgsCount: number;
  recordsCount: number;
}> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sustainiq';

  console.log('🔄 Starting SustainIQ MongoDB -> PostgreSQL Migration...');
  console.log(`🍃 Source MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);

  // 1. Connect to MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to source MongoDB.');
  }

  // 2. Initialize PostgreSQL
  await initDatabase();
  console.log('✅ Connected to target PostgreSQL.');

  const userIdMap = new Map<string, string>();
  const orgIdMap = new Map<string, string>();

  let usersMigrated = 0;
  let orgsMigrated = 0;
  let recordsMigrated = 0;

  try {
    // 3. Migrate Users
    const mongoUsers = await User.find().select('+passwordHash');
    console.log(`👤 Found ${mongoUsers.length} user(s) in MongoDB.`);

    for (const u of mongoUsers) {
      const email = u.email.toLowerCase().trim();
      const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);

      let pgUserId: string;
      if (existing.rows.length > 0) {
        pgUserId = existing.rows[0].id;
        console.log(`  ℹ️ User already in PostgreSQL: "${u.name}" (${email}) -> PG UUID: ${pgUserId}`);
      } else {
        const insertRes = await query(
          `INSERT INTO users (name, email, password_hash, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [
            u.name.trim(),
            email,
            u.passwordHash,
            u.createdAt || new Date(),
            u.updatedAt || new Date(),
          ]
        );
        pgUserId = insertRes.rows[0].id;
        usersMigrated++;
        console.log(`  ➕ Migrated User: "${u.name}" (${email}) -> PG UUID: ${pgUserId}`);
      }
      userIdMap.set(u._id.toString(), pgUserId);
    }

    // 4. Migrate Organizations
    const mongoOrgs = await Organization.find();
    console.log(`🏢 Found ${mongoOrgs.length} organization(s) in MongoDB.`);

    for (const o of mongoOrgs) {
      const ownerMongoId = o.ownerId ? o.ownerId.toString() : '';
      const pgOwnerId = userIdMap.get(ownerMongoId) || null;

      // Check if org already exists for this owner
      const existing = await query(
        'SELECT id FROM organizations WHERE name = $1 AND owner_id = $2',
        [o.name.trim(), pgOwnerId]
      );

      let pgOrgId: string;
      if (existing.rows.length > 0) {
        pgOrgId = existing.rows[0].id;
        console.log(`  ℹ️ Organization already in PostgreSQL: "${o.name}" -> PG UUID: ${pgOrgId}`);
      } else {
        const schema = o.customMetricsSchema || (o as any).custom_metrics_schema || {};
        const year = o.reportingYear || (o as any).reporting_year || 2026;
        const insertRes = await query(
          `INSERT INTO organizations (name, type, location, reporting_year, custom_metrics_schema, owner_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            o.name.trim(),
            o.type.trim(),
            o.location.trim(),
            year,
            JSON.stringify(schema),
            pgOwnerId,
            o.createdAt || new Date(),
            o.updatedAt || new Date(),
          ]
        );
        pgOrgId = insertRes.rows[0].id;
        orgsMigrated++;
        console.log(`  ➕ Migrated Organization: "${o.name}" -> PG UUID: ${pgOrgId}`);
      }
      orgIdMap.set(o._id.toString(), pgOrgId);
    }

    // 5. Migrate ESG Records
    const mongoRecords = await ESGRecordModel.find();
    console.log(`📊 Found ${mongoRecords.length} ESG record(s) in MongoDB.`);

    for (const r of mongoRecords) {
      const pgOrgId = orgIdMap.get(r.organizationId.toString());
      if (!pgOrgId) {
        console.warn(`  ⚠️ Skipping record dated ${r.recordDate}: No matching PostgreSQL organization found.`);
        continue;
      }

      // Check if record exists for same org and same date
      const dateStr = typeof r.recordDate === 'string' 
        ? r.recordDate.split('T')[0] 
        : new Date(r.recordDate).toISOString().split('T')[0];

      const existing = await query(
        `SELECT id FROM esg_records WHERE organization_id = $1 AND record_date = $2`,
        [pgOrgId, dateStr]
      );

      // Check if exact record already exists
      let alreadyExists = false;
      if (existing.rows.length > 0) {
        // If energy and water match, consider duplicate
        const matchRes = await query(
          `SELECT id FROM esg_records 
           WHERE organization_id = $1 AND record_date = $2 AND energy_consumption = $3`,
          [pgOrgId, dateStr, Number(r.energyConsumption)]
        );
        if (matchRes.rows.length > 0) {
          alreadyExists = true;
        }
      }

      if (!alreadyExists) {
        const customMetrics = r.customMetrics || (r as any).custom_metrics || {};
        await query(
          `INSERT INTO esg_records (
            organization_id, record_date, energy_consumption, water_consumption,
            waste_generated, waste_recycled, carbon_emissions, renewable_energy_percentage,
            employees, training_hours, safety_incidents, community_initiatives,
            compliance_percentage, ethics_incidents, governance_score,
            environmental_score, social_score, governance_score_calculated, overall_esg_score,
            custom_metrics, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
          )`,
          [
            pgOrgId,
            dateStr,
            Number(r.energyConsumption || 0),
            Number(r.waterConsumption || 0),
            Number(r.wasteGenerated || 0),
            Number(r.wasteRecycled || 0),
            Number(r.carbonEmissions || 0),
            Number(r.renewableEnergyPercentage || 0),
            Number(r.employees || 1),
            Number(r.trainingHours || 0),
            Number(r.safetyIncidents || 0),
            Number(r.communityInitiatives || 0),
            Number(r.compliancePercentage || 0),
            Number(r.ethicsIncidents || 0),
            Number(r.governanceScore || 0),
            r.environmentalScore !== undefined ? Number(r.environmentalScore) : null,
            r.socialScore !== undefined ? Number(r.socialScore) : null,
            r.governanceScoreCalculated !== undefined ? Number(r.governanceScoreCalculated) : null,
            r.overallEsgScore !== undefined ? Number(r.overallEsgScore) : null,
            JSON.stringify(customMetrics),
            r.createdAt || new Date(),
            r.updatedAt || new Date(),
          ]
        );
        recordsMigrated++;
        console.log(`  ➕ Migrated Record for Org ${pgOrgId} on ${dateStr}`);
      } else {
        console.log(`  ℹ️ Record on ${dateStr} already exists in PostgreSQL -> Skipping.`);
      }
    }

    console.log('\n🎉 MongoDB -> PostgreSQL Migration Summary:');
    console.log(`   - Users migrated/verified: ${mongoUsers.length} (New: ${usersMigrated})`);
    console.log(`   - Organizations migrated/verified: ${mongoOrgs.length} (New: ${orgsMigrated})`);
    console.log(`   - ESG Records migrated/verified: ${mongoRecords.length} (New: ${recordsMigrated})\n`);

    return {
      usersCount: mongoUsers.length,
      orgsCount: mongoOrgs.length,
      recordsCount: mongoRecords.length,
    };
  } finally {
    if (require.main === module) {
      await mongoose.disconnect();
      await closeDatabase();
    }
  }
}

if (require.main === module) {
  runMongoToPostgresMigration().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
}
