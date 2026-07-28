import test from 'node:test';
import assert from 'node:assert';
import { createAvailabilitySchema, createBookingSchema, updateLeadStageSchema } from '../src/validators/engagement.validators.js';
import { prisma } from '../src/lib/prisma.js';
import { createAvailabilitySlot, createAtomicBooking, rescheduleBooking, updateLeadStage } from '../src/services/engagement.service.js';

test('Engagement Service Unit & Validator Tests', async (t) => {
  await t.test('Availability validator enforces valid date YYYY-MM-DD', () => {
    const valid = createAvailabilitySchema.safeParse({
      propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date: '2026-08-01',
      timeSlot: '10:00-11:00'
    });
    assert.strictEqual(valid.success, true);

    const invalidDate = createAvailabilitySchema.safeParse({
      propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date: '01-08-2026',
      timeSlot: '10:00-11:00'
    });
    assert.strictEqual(invalidDate.success, false);
  });

  await t.test('Booking validator requires valid availability UUID', () => {
    const valid = createBookingSchema.safeParse({
      propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      availabilityId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
    });
    assert.strictEqual(valid.success, true);

    const invalid = createBookingSchema.safeParse({
      propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      availabilityId: 'invalid-id'
    });
    assert.strictEqual(invalid.success, false);
  });

  await t.test('Lead stage validator enforces valid LeadStage enum values', () => {
    const valid = updateLeadStageSchema.safeParse({ toStage: 'VISIT_COMPLETED' });
    assert.strictEqual(valid.success, true);

    const invalid = updateLeadStageSchema.safeParse({ toStage: 'INVALID_STAGE' });
    assert.strictEqual(invalid.success, false);
  });
});

test('Race-Condition & Lifecycle Edge-Case Integration Tests', async (t) => {
  const testPropertyId = '11111111-2222-3333-4444-555555555555';
  const testOwnerId = 'owner-uuid-999';
  const testBuyer1 = 'buyer-uuid-101';
  const testBuyer2 = 'buyer-uuid-102';

  let slot1;
  let slot2;

  t.before(async () => {
    // Clean up test records
    await prisma.notification.deleteMany({});
    await prisma.leadStageHistory.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.availabilityCalendar.deleteMany({});

    // Seed 2 availability slots
    slot1 = await createAvailabilitySlot(testOwnerId, testPropertyId, '2026-08-10', '10:00-11:00');
    slot2 = await createAvailabilitySlot(testOwnerId, testPropertyId, '2026-08-10', '11:30-12:30');
  });

  t.after(async () => {
    await prisma.notification.deleteMany({});
    await prisma.leadStageHistory.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.availabilityCalendar.deleteMany({});
    await prisma.$disconnect();
  });

  await t.test('RACE CONDITION: Two simultaneous booking requests for the same slot must reject one cleanly (UC-ES-02)', async () => {
    const results = await Promise.allSettled([
      createAtomicBooking(testBuyer1, testPropertyId, slot1.id, 'Buyer 1 request'),
      createAtomicBooking(testBuyer2, testPropertyId, slot1.id, 'Buyer 2 request')
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    assert.strictEqual(fulfilled.length, 1, 'Exactly one booking request must succeed');
    assert.strictEqual(rejected.length, 1, 'Exactly one booking request must fail with slot locked error');
    assert.strictEqual(rejected[0].reason.code, 'SLOT_ALREADY_BOOKED');
    assert.strictEqual(rejected[0].reason.status, 409);
  });

  await t.test('RESCHEDULE EDGE CASE: Reschedule fails if target slot is already booked (FR-BOOK-04, UC-ES-03)', async () => {
    // Book slot2 first
    await createAtomicBooking(testBuyer2, testPropertyId, slot2.id, 'Booking slot 2');

    // Fetch buyer 1's booking on slot1
    const booking1 = await prisma.booking.findFirst({ where: { buyerId: testBuyer1 } });

    // Buyer 1 tries to reschedule to slot2 (which is now booked)
    try {
      await rescheduleBooking(booking1.id, testBuyer1, slot2.id, 'Attempting to switch to slot 2');
      assert.fail('Should have thrown target slot unavailable error');
    } catch (err) {
      const code = err.code || err.reason?.code || (typeof err === 'object' ? err.code : null);
      assert.strictEqual(code, 'TARGET_SLOT_UNAVAILABLE');
    }
  });

  await t.test('LEAD STAGE MACHINE: Invalid non-sequential stage transition throws error (FR-LEAD-03)', async () => {
    const lead = await prisma.lead.findFirst({ where: { buyerId: testBuyer1 } });
    
    // Lead is currently at VISIT_SCHEDULED. Attempting to directly jump to CLOSED_WON must fail.
    try {
      await updateLeadStage(lead.id, testOwnerId, 'CLOSED_WON', 'Illegal jump');
      assert.fail('Should have rejected non-sequential transition');
    } catch (err) {
      const code = err.code || err.reason?.code || (typeof err === 'object' ? err.code : null);
      assert.strictEqual(code, 'INVALID_STAGE_TRANSITION');
    }
  });


});
