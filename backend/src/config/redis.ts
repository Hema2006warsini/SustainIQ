import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: Redis | null = null;
let isRedisConnected = false;

// In-memory fallback cache when standalone Redis is offline
const memoryCache = new Map<string, { value: string; expiry: number }>();

const cacheStats = {
  hits: 0,
  misses: 0,
  invalidations: 0,
};

export function initRedis(): void {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts in standalone mode
        }
        return Math.min(times * 200, 1000);
      },
      connectTimeout: 2000,
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('✅ Connected to Redis cache successfully at', redisUrl);
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      // Don't flood the console with repetitive reconnect errors in dev mode
    });

    redisClient.on('close', () => {
      isRedisConnected = false;
    });
  } catch (err: any) {
    console.warn('⚠️  Redis connection initialization warning:', err.message);
    isRedisConnected = false;
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        cacheStats.hits++;
        return JSON.parse(data) as T;
      }
      cacheStats.misses++;
      return null;
    } catch (err) {
      console.warn('Redis GET failed, checking memory fallback:', err);
    }
  }

  // Memory fallback
  const cached = memoryCache.get(key);
  if (cached) {
    if (Date.now() < cached.expiry) {
      cacheStats.hits++;
      return JSON.parse(cached.value) as T;
    } else {
      memoryCache.delete(key);
    }
  }
  cacheStats.misses++;
  return null;
}

export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  const serialized = JSON.stringify(value);

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.setex(key, ttlSeconds, serialized);
      return;
    } catch (err) {
      console.warn('Redis SETEX failed, writing to memory fallback:', err);
    }
  }

  // Memory fallback
  memoryCache.set(key, {
    value: serialized,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export async function invalidateCache(key: string): Promise<void> {
  cacheStats.invalidations++;

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn('Redis DEL failed:', err);
    }
  }

  memoryCache.delete(key);
}

export async function invalidateOrgCache(organizationId: string): Promise<void> {
  const key = `dashboard:org:${organizationId}`;
  await invalidateCache(key);
}

export function getCacheStats() {
  return {
    ...cacheStats,
    redisConnected: isRedisConnected,
    activeKeysCount: memoryCache.size,
    type: isRedisConnected ? 'Redis (Live Server)' : 'Redis In-Memory Engine',
  };
}
