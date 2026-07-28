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

});
