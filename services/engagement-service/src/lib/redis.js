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
redis.on('error', (err) => logger.warn('Redis Cache Connection Warning:', err.message));

/**
 * Publish event to Redis Pub/Sub for downstream services (e.g. Analytics Service)
 */
export const publishEvent = async (channel, payload) => {
  try {
    const message = JSON.stringify({
      event: channel,
      timestamp: new Date().toISOString(),
      data: payload
    });
    await redis.publish(channel, message);
    logger.info(`[Redis Pub/Sub] Published event '${channel}'`);
  } catch (err) {
    logger.warn(`[Redis Pub/Sub Warning] Failed to publish event '${channel}': ${err.message}`);
  }
};
