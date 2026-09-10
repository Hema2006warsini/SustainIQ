import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initDatabase } from './config/database';
import { initRedis } from './config/redis';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*', // Allow development frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'SustainIQ API',
    description: 'Smart ESG Monitoring & Analytics Platform Backend',
    version: '1.0.0',
    zeroSeedPolicy: 'Active (No fake/demo data)',
    endpoints: {
      health: '/api/health',
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

    app.listen(PORT, () => {
      console.log(`🚀 SustainIQ Backend API running on http://localhost:${PORT}`);
      console.log(`📊 Zero-Seed Policy: Starting empty. Awaiting user input.`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
