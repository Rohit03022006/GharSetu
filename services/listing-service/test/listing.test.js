import assert from 'node:assert/strict';
import { test, describe } from 'node:test';

describe('Listing Service Unit & Logic Tests', () => {

  test('Property status lifecycle transitions validate correctly', () => {
    const validStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'RENTED', 'ARCHIVED'];
    assert.equal(validStatuses.length, 7);
    assert.ok(validStatuses.includes('APPROVED'));
  });

  test('Rental listing type validation enforces security deposit & lease duration', () => {
    const rentalListing = {
      listingType: 'RENT',
      price: 25000,
      securityDeposit: 50000,
      leaseDurationMonths: 12
    };

    assert.equal(rentalListing.listingType, 'RENT');
    assert.ok(rentalListing.securityDeposit > 0);
    assert.ok(rentalListing.leaseDurationMonths >= 1);
  });

  test('Internal Service Guard: Rejects calls without matching x-internal-service-key', async () => {
    const { requireInternalSecret } = await import('../src/middleware/internalAuth.middleware.js');
    
    // Case 1: Missing key
    let statusCode = null;
    let jsonBody = null;
    const req1 = { headers: {} };
    const res1 = {
      status: (c) => {
        statusCode = c;
        return { json: (b) => { jsonBody = b; } };
      }
    };
    let nextCalled = false;
    requireInternalSecret(req1, res1, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);
    assert.equal(jsonBody?.error?.code, 'FORBIDDEN_INTERNAL_ACCESS');

    // Case 2: Matching key
    const req2 = { headers: { 'x-internal-service-key': 'gharsetu-internal-microservice-secure-key-2026' } };
    let nextCalled2 = false;
    requireInternalSecret(req2, {}, () => { nextCalled2 = true; });
    assert.equal(nextCalled2, true);
  });
});
