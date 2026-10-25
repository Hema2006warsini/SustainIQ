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

// Security & Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Dynamic CORS configuration allowing credentials
const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (curl, server-to-server, mobile apps) or if matching allowed list
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
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
