import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  calculateEmi,
  calculateStampDuty,
  calculateGst,
  calculateMaintenance,
  calculateRentAffordability
} from '../src/services/financeCalculator.service.js';

describe('Finance Suite Calculator Pure Logic Tests', () => {

  test('FR-FIN-01: Standard Reducing Balance EMI calculation', () => {
    // ₹50,00,000 Loan, 8.5% Annual Interest, 20 Years Tenure
    const result = calculateEmi(5000000, 8.5, 20);

    assert.equal(result.loanAmount, 5000000);
    assert.equal(result.tenureMonths, 240);
    assert.equal(result.monthlyEmi, 43391); // Expected standard EMI value
    assert.ok(result.totalInterest > 0);
    assert.equal(result.totalPayment, result.monthlyEmi * 240);
  });

  test('FR-FIN-02: Stamp Duty & Registration Charges calculation', () => {
    // ₹1,00,00,000 Property in Maharashtra (6% Stamp Duty, 1% Registration)
    const result = calculateStampDuty(10000000, 6.0, 1.0);

    assert.equal(result.stampDutyAmount, 600000);
    assert.equal(result.regAmount, 100000);
    assert.equal(result.totalGovernmentCharges, 700000);
  });

  test('FR-FIN-03: GST applicability based on Construction Status', () => {

    // Case 1: UNDER_CONSTRUCTION (5% GST applies)
    const underConst = calculateGst(5000000, 'UNDER_CONSTRUCTION', 5.0);
    assert.equal(underConst.isGstApplicable, true);
    assert.equal(underConst.gstAmount, 250000);
    assert.equal(underConst.totalPriceWithGst, 5250000);

    // Case 2: READY_TO_MOVE (GST is 0% / Not Applicable)
    const readyToMove = calculateGst(5000000, 'READY_TO_MOVE', 5.0);
    assert.equal(readyToMove.isGstApplicable, false);
    assert.equal(readyToMove.gstAmount, 0);
  });

  test('FR-FIN-04: Estimated Maintenance Cost Range calculation', () => {
    // 1200 Sq Ft Apartment in Tier 1 City (₹3 - ₹6 per sq ft)
    const result = calculateMaintenance(1200, 'TIER_1', 'APARTMENT');

    assert.equal(result.monthlyMin, 3600); // 1200 * 3
    assert.equal(result.monthlyMax, 7200); // 1200 * 6
    assert.equal(result.yearlyMin, 43200);
    assert.equal(result.yearlyMax, 86400);

    // Case 2: PLOT should return 0 maintenance
    const plotResult = calculateMaintenance(2000, 'TIER_1', 'PLOT');
    assert.equal(plotResult.monthlyMin, 0);
    assert.equal(plotResult.monthlyMax, 0);
  });

  test('FR-FIN-05: Rent Affordability calculations', () => {
    // ₹1,00,000 Monthly Income with ₹10,000 Existing EMI
    const result = calculateRentAffordability(100000, 10000);

    assert.equal(result.netAvailableIncome, 90000);
    assert.equal(result.maxRecommendedRent, 27000); // 30% of ₹90,000
    assert.equal(result.maxAggressiveRent, 36000);   // 40% of ₹90,000
  });

});
