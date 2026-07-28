import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

/**
 * Idempotent Event Aggregation Engine (FR-ANLY-01)
 * Processes incoming Pub/Sub events with strict deduplication using ProcessedEvent table.
 */
export const processAnalyticsEvent = async (eventKey, payload) => {
  if (!eventKey || !payload) return;

  const eventId = payload.eventId || `${eventKey}-${payload.bookingId || payload.leadId || payload.propertyId}-${payload.scheduledDate || new Date().toISOString().split('T')[0]}`;
  const today = payload.date || new Date().toISOString().split('T')[0];

  try {
    // 1. Idempotency Check: Prevent Double Counting
    const existing = await prisma.processedEvent.findUnique({
      where: { eventId }
    });

    if (existing) {
      logger.info(`[Analytics Aggregator] Event '${eventId}' already processed. Skipping (Idempotent).`);
      return { status: 'SKIPPED_DUPLICATE' };
    }

    // 2. Aggregate Metric inside Transaction
    await prisma.$transaction(async (tx) => {
      // Record Processed Event
      await tx.processedEvent.create({
        data: {
          eventId,
          eventType: eventKey
        }
      });

      if (!payload.propertyId || !payload.ownerId) return;

      const metricWhere = {
        propertyId_date: {
          propertyId: payload.propertyId,
          date: today
        }
      };

      if (eventKey === 'property.viewed') {
        await tx.propertyDailyMetric.upsert({
          where: metricWhere,
          create: { propertyId: payload.propertyId, ownerId: payload.ownerId, date: today, viewsCount: 1 },
          update: { viewsCount: { increment: 1 } }
        });
      } else if (eventKey === 'booking.created') {
        await tx.propertyDailyMetric.upsert({
          where: metricWhere,
          create: { propertyId: payload.propertyId, ownerId: payload.ownerId, date: today, bookingsCount: 1, leadsCount: 1 },
          update: { bookingsCount: { increment: 1 }, leadsCount: { increment: 1 } }
        });
      } else if (eventKey === 'booking.completed') {
        await tx.propertyDailyMetric.upsert({
          where: metricWhere,
          create: { propertyId: payload.propertyId, ownerId: payload.ownerId, date: today, completionsCount: 1 },
          update: { completionsCount: { increment: 1 } }
        });
      }
    });

    logger.info(`[Analytics Aggregator] Processed event '${eventKey}' for property ${payload.propertyId}`);
    return { status: 'PROCESSED' };
  } catch (err) {
    logger.error(`[Analytics Aggregator Error] Failed processing event '${eventKey}': ${err.message}`);
    throw err;
  }
};
