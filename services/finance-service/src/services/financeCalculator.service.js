/**
 * Pure Mathematical & Financial Calculations
 * Standard Reducing Balance EMI Formula:
 * EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
 * P = Principal Loan Amount
 * R = Monthly Interest Rate (Annual Rate / 12 / 100)
 * N = Total Tenure in Months (Years * 12)
 */

export const calculateEmi = (loanAmount, annualInterestRate, tenureYears) => {
  const P = loanAmount;
  const R = annualInterestRate / 12 / 100;
  const N = tenureYears * 12;

  // EMI calculation
  const emiNumerator = P * R * Math.pow(1 + R, N);
  const emiDenominator = Math.pow(1 + R, N) - 1;
  const monthlyEmi = Math.round(emiNumerator / emiDenominator);

  const totalPayment = monthlyEmi * N;
  const totalInterest = totalPayment - P;

  return {
    loanAmount: P,
    annualInterestRate,
    tenureYears,
    tenureMonths: N,
    monthlyEmi,
    totalInterest,
    totalPayment,
    summaryText: `Your estimated EMI is ₹${monthlyEmi.toLocaleString('en-IN')}/month for ${tenureYears} years.`
  };
};

/**
 * Stamp Duty and Registration Charges
 */
export const calculateStampDuty = (propertyPrice, stampDutyPercent, regPercent) => {
  const stampDutyAmount = Math.round((propertyPrice * stampDutyPercent) / 100);
  const regAmount = Math.round((propertyPrice * regPercent) / 100);
  const totalGovernmentCharges = stampDutyAmount + regAmount;

  return {
    propertyPrice,
    stampDutyPercent,
    stampDutyAmount,
    regPercent,
    regAmount,
    totalGovernmentCharges,
    summaryText: `Government charges total ₹${totalGovernmentCharges.toLocaleString('en-IN')} (Stamp Duty ${stampDutyPercent}% + Registration ${regPercent}%).`
  };
};

/**
 * Goods and Services Tax (GST) Logic:
 * - UNDER_CONSTRUCTION: Applicable (default 5.0% or state rate)
 * - READY_TO_MOVE: GST is NOT APPLICABLE (0%)
 */
export const calculateGst = (propertyPrice, constructionStatus, gstPercent = 5.0) => {
  if (constructionStatus === 'READY_TO_MOVE') {
    return {
      propertyPrice,
      constructionStatus,
      isGstApplicable: false,
      gstPercent: 0,
      gstAmount: 0,
      summaryText: `No GST is applicable for Ready-to-Move properties.`
    };
  }

  const gstAmount = Math.round((propertyPrice * gstPercent) / 100);
  return {
    propertyPrice,
    constructionStatus,
    isGstApplicable: true,
    gstPercent,
    gstAmount,
    totalPriceWithGst: propertyPrice + gstAmount,
    summaryText: `GST of ${gstPercent}% applies to Under Construction properties, adding ₹${gstAmount.toLocaleString('en-IN')}.`
  };
};

/**
 * Maintenance Cost Estimation Range:
 * Rates per sq ft per month based on City Tier and Property Type:
 * Tier 1: ₹3 - ₹6 / sq ft
 * Tier 2: ₹2 - ₹4 / sq ft
 * Tier 3: ₹1 - ₹2.5 / sq ft
 * Plot: ₹0 (No monthly maintenance)
 */
export const calculateMaintenance = (areaSqFt, cityTier, propertyType) => {
  if (propertyType === 'PLOT') {
    return {
      areaSqFt,
      cityTier,
      propertyType,
      monthlyMin: 0,
      monthlyMax: 0,
      yearlyMin: 0,
      yearlyMax: 0,
      summaryText: `No regular maintenance charges for plots.`
    };
  }

  let minRate = 2;
  let maxRate = 4;

  if (cityTier === 'TIER_1') {
    minRate = propertyType === 'VILLA' ? 4 : 3;
    maxRate = propertyType === 'VILLA' ? 7 : 6;
  } else if (cityTier === 'TIER_2') {
    minRate = propertyType === 'VILLA' ? 3 : 2;
    maxRate = propertyType === 'VILLA' ? 5 : 4;
  } else if (cityTier === 'TIER_3') {
    minRate = 1;
    maxRate = 2.5;
  }

  const monthlyMin = Math.round(areaSqFt * minRate);
  const monthlyMax = Math.round(areaSqFt * maxRate);

  return {
    areaSqFt,
    cityTier,
    propertyType,
    ratePerSqFtRange: `₹${minRate} - ₹${maxRate}`,
    monthlyMin,
    monthlyMax,
    yearlyMin: monthlyMin * 12,
    yearlyMax: monthlyMax * 12,
    summaryText: `Estimated monthly maintenance is ₹${monthlyMin.toLocaleString('en-IN')} - ₹${monthlyMax.toLocaleString('en-IN')}/month.`
  };
};

/**
 * Rent Affordability Rule:
 * Financial Golden Rule: Maximum 30% of net monthly income should go to rent after existing EMIs.
 */
export const calculateRentAffordability = (monthlyIncome, existingEmi = 0) => {
  const netIncome = Math.max(0, monthlyIncome - existingEmi);
  const maxRecommendedRent = Math.round(netIncome * 0.30);
  const maxAggressiveRent = Math.round(netIncome * 0.40);

  return {
    monthlyIncome,
    existingEmi,
    netAvailableIncome: netIncome,
    maxRecommendedRent, // 30% rule
    maxAggressiveRent,  // 40% rule
    summaryText: `Based on your monthly income of ₹${monthlyIncome.toLocaleString('en-IN')}, your recommended safe monthly rent budget is up to ₹${maxRecommendedRent.toLocaleString('en-IN')}.`
  };
};
