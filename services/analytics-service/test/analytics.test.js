import test from 'node:test';
import assert from 'node:assert';

import { processAnalyticsEvent } from '../src/services/analyticsAggregator.service.js';
import { prisma } from '../src/lib/prisma.js';

test('Analytics Aggregator & Idempotency Test Suite', async (t) => {
  const testPropertyId = 'prop-test-uuid-888';
  const testOwnerId = 'owner-test-uuid-999';
  const testEventId = 'evt-unique-test-12345';
  const testDate = '2026-08-15';

  t.after(async () => {
    await prisma.processedEvent.deleteMany({ where: { eventId: testEventId } });
    await prisma.propertyDailyMetric.deleteMany({ where: { propertyId: testPropertyId } });
  });

  await t.test('IDEMPOTENCY: Re-running event aggregation batch twice prevents double counting (FR-ANLY-01)', async () => {
    const payload = {
      eventId: testEventId,
      propertyId: testPropertyId,
      ownerId: testOwnerId,
      date: testDate
    };

    // First Processing Run
    const run1 = await processAnalyticsEvent('booking.created', payload);
    assert.strictEqual(run1.status, 'PROCESSED');

    // Verify DB count = 1
    const metric1 = await prisma.propertyDailyMetric.findUnique({
      where: { propertyId_date: { propertyId: testPropertyId, date: testDate } }
    });
    assert.strictEqual(metric1.bookingsCount, 1);
    assert.strictEqual(metric1.leadsCount, 1);

    // Second Processing Run (Simulating duplicate Pub/Sub delivery)
    const run2 = await processAnalyticsEvent('booking.created', payload);
    assert.strictEqual(run2.status, 'SKIPPED_DUPLICATE');

    // Verify DB count is still 1 (No double-counting!)
    const metric2 = await prisma.propertyDailyMetric.findUnique({
      where: { propertyId_date: { propertyId: testPropertyId, date: testDate } }
    });
    assert.strictEqual(metric2.bookingsCount, 1);
    assert.strictEqual(metric2.leadsCount, 1);
  });
});
