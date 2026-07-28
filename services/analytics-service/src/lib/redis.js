import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL;

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  }
});

redis.on('connect', () => logger.info('Connected to Redis Cache Engine'));
redis.on('error', (err) => logger.warn('Redis Cache Warning:', err.message));

// Redis Subscriber Client for Event Streaming
export const subscriber = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  }
});
