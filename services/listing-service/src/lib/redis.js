import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  logger.info('Connected to Redis Cache Engine');
});

redis.on('error', (err) => {
  logger.warn('Redis Cache Error (Search fallback to DB enabled):', err.message);
});

/**
 * Cache search result with 5-minute TTL (FR-SEARCH-03)
 */
export const cacheSearchResult = async (key, data, ttlSeconds = 300) => {
  try {
    await redis.setex(`search:${key}`, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    logger.warn('Failed to set Redis cache:', err.message);
  }
};

/**
 * Retrieve cached search result
 */
export const getCachedSearchResult = async (key) => {
  try {
    const cached = await redis.get(`search:${key}`);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    logger.warn('Failed to get Redis cache:', err.message);
    return null;
  }
};

/**
 * Invalidate all cached search results when property status/fields change (FR-SEARCH-04)
 */
export const invalidateSearchCache = async () => {
  try {
    const keys = await redis.keys('search:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Invalidated ${keys.length} search cache entries.`);
    }
  } catch (err) {
    logger.warn('Failed to invalidate Redis search cache:', err.message);
  }
};
