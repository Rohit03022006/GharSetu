import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  }
});

redis.on('connect', () => logger.info('Connected to Redis Cache Engine'));
redis.on('error', (err) => logger.warn('Redis Cache Connection Warning:', err.message));

export const getCachedProperty = async (propertyId) => {
  try {
    const data = await redis.get(`pref:property:${propertyId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.warn(`Redis GET failed for pref:property:${propertyId}:`, error.message);
    return null;
  }
};

export const cacheProperty = async (propertyId, data, ttlSeconds = 120) => {
  try {
    await redis.setex(`pref:property:${propertyId}`, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    logger.warn(`Redis SETEX failed for pref:property:${propertyId}:`, error.message);
  }
};
