import { Request, Response, NextFunction } from 'express';
import { getDatabaseStatus } from '../config/database';
import { getCache, getCacheStats, setCache } from '../config/redis';
import { getDashboardStats } from '../services/dashboardService';
import '../middleware/auth';
import { DashboardStats } from '../types';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const userId = req.user!.id;
    const cacheKey = `dashboard:user:${userId}:org:${orgId}`;

    // 1. Check Redis cache
    const cachedData = await getCache<DashboardStats>(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        cacheStatus: 'HIT',
      });
    }

    // 2. Cache MISS: query database with user ownership verification
    const stats = await getDashboardStats(orgId, userId);
    if (!stats) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // 3. Cache populated result for 3600 seconds
    await setCache(cacheKey, stats, 3600);

    // 4. Return live calculated response
    res.json({
      ...stats,
      cacheStatus: 'MISS',
    });
  } catch (err) {
    next(err);
  }
}

export function getSystemHealth(req: Request, res: Response) {
  const dbStatus = getDatabaseStatus();
  const cacheStats = getCacheStats();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      type: dbStatus.type,
      connected: dbStatus.connected,
      database: dbStatus.database,
      host: dbStatus.host,
      policy: 'Zero Seed Data — Real Telemetry Only',
    },
    redis: {
      connected: cacheStats.redisConnected,
      engine: cacheStats.type,
      stats: {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        invalidations: cacheStats.invalidations,
      },
    },
  });
}
