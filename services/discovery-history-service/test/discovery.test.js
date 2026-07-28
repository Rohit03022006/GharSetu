import test from 'node:test';
import assert from 'node:assert';
import { logViewSchema, logSearchSchema } from '../src/validators/discovery.validators.js';

test('Discovery-History Service Unit & Logic Tests', async (t) => {
  await t.test('Property view validator requires valid UUID', () => {
    const valid = logViewSchema.safeParse({ propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
    assert.strictEqual(valid.success, true);

    const invalid = logViewSchema.safeParse({ propertyId: 'invalid-id' });
    assert.strictEqual(invalid.success, false);
  });

  await t.test('Search history validator requires filter record', () => {
    const valid = logSearchSchema.safeParse({ filters: { city: 'Navi Mumbai', bedrooms: 3 } });
    assert.strictEqual(valid.success, true);

    const invalid = logSearchSchema.safeParse({});
    assert.strictEqual(invalid.success, false);
  });
});
