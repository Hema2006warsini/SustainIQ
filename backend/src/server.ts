import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { initDatabase } from './config/database';
import { initRedis } from './config/redis';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for reverse proxies (Render, Cloudflare, AWS)
app.set('trust proxy', 1);

// Security & Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Helper to normalize origins (remove trailing slashes, whitespace)
function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

// Configured allowed origins from environment (supports comma-separated values)
const rawEnvOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const configuredOrigins: string[] = [];
for (const raw of rawEnvOrigins) {
  for (const part of raw.split(',')) {
    const trimmed = normalizeOrigin(part);
    if (trimmed) configuredOrigins.push(trimmed);
  }
}

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Allow server-to-server, mobile apps, curl, uptime monitors
  
  const normalized = normalizeOrigin(origin);

  // Check explicit configured list or dev defaults
  if (configuredOrigins.includes(normalized) || defaultDevOrigins.includes(normalized)) {
    return true;
  }

  // Automatically allow any Vercel deployment (*.vercel.app or vercel.app)
  try {
    const parsed = new URL(normalized);
    if (parsed.hostname.endsWith('.vercel.app') || parsed.hostname === 'vercel.app') {
      return true;
    }
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return true;
    }
  } catch {
    // Malformed origin
  }

  // In non-production, allow all
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
}

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        // Standard rejection without throwing 500 error
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'SustainIQ API',
    description: 'Smart ESG Monitoring & Analytics Platform Backend',
    version: '2.0.0',
    database: 'PostgreSQL',
    zeroSeedPolicy: 'Active (No fake/demo data)',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
      organizations: '/api/organizations',
      esg: '/api/esg',
    },
  });
});

// Global Error Handler
app.use(errorHandler);

// Bootstrap
async function startServer() {
  try {
    await initDatabase();
    initRedis();

    const portNumber = Number(PORT) || 5000;
    app.listen(portNumber, '0.0.0.0', () => {
      console.log(`🚀 SustainIQ Backend API running on http://0.0.0.0:${portNumber}`);
      console.log(`📊 Zero-Seed Policy: Starting empty. Awaiting user input.`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
