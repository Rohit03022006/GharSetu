import test from 'node:test';
import assert from 'node:assert';
import { addWishlistSchema, comparePropertiesSchema } from '../src/validators/preference.validators.js';

test('Preference Service Unit & Logic Tests', async (t) => {
  await t.test('Wishlist validator enforces valid property UUID', () => {
    const valid = addWishlistSchema.safeParse({
      propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      notes: 'Interested in ocean view'
    });
    assert.strictEqual(valid.success, true);

    const invalid = addWishlistSchema.safeParse({ propertyId: 'not-a-uuid' });
    assert.strictEqual(invalid.success, false);
  });

  await t.test('Property comparison validator enforces min 2 and max 4 properties', () => {
    const valid = comparePropertiesSchema.safeParse({
      propertyIds: [
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
      ]
    });
    assert.strictEqual(valid.success, true);

    const single = comparePropertiesSchema.safeParse({
      propertyIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11']
    });
    assert.strictEqual(single.success, false);

    const tooMany = comparePropertiesSchema.safeParse({
      propertyIds: [
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55'
      ]
    });
    assert.strictEqual(tooMany.success, false);
  });
});
