import { subscriber } from '../lib/redis.js';
import { processAnalyticsEvent } from '../services/analyticsAggregator.service.js';
import { logger } from '../utils/logger.js';

export const initRedisSubscriber = () => {
  const channels = ['property.viewed', 'booking.created', 'booking.completed', 'lead.stage_changed'];

  subscriber.subscribe(...channels, (err, count) => {
    if (err) {
      logger.error('Failed to subscribe to Redis Pub/Sub channels:', err.message);
    } else {
      logger.info(`[Redis Subscriber] Subscribed to ${count} analytics channels.`);
    }
  });

  subscriber.on('message', async (channel, message) => {
    try {
      const parsed = JSON.parse(message);
      logger.info(`[Redis Subscriber] Received message on channel '${channel}'`);
      await processAnalyticsEvent(channel, parsed.data);
    } catch (err) {
      logger.warn(`[Redis Subscriber Error] Invalid message payload on channel '${channel}': ${err.message}`);
    }
  });
};
