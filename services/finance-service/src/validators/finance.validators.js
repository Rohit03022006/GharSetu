import { z } from 'zod';

export const emiSchema = z.object({
  loanAmount: z.number({ invalid_type_error: 'loanAmount must be a number' }).positive('loanAmount must be greater than 0'),
  annualInterestRate: z.number({ invalid_type_error: 'annualInterestRate must be a number' }).positive('annualInterestRate must be greater than 0'),
  tenureYears: z.number({ invalid_type_error: 'tenureYears must be a number' }).positive('tenureYears must be greater than 0')
});

export const stampDutySchema = z.object({
  propertyPrice: z.number({ invalid_type_error: 'propertyPrice must be a number' }).positive('propertyPrice must be greater than 0'),
  state: z.string().min(2, 'state name is required')
});

export const gstSchema = z.object({
  propertyPrice: z.number({ invalid_type_error: 'propertyPrice must be a number' }).positive('propertyPrice must be greater than 0'),
  constructionStatus: z.enum(['UNDER_CONSTRUCTION', 'READY_TO_MOVE'], {
    errorMap: () => ({ message: "constructionStatus must be 'UNDER_CONSTRUCTION' or 'READY_TO_MOVE'" })
  }),
  state: z.string().optional()
});

export const maintenanceSchema = z.object({
  areaSqFt: z.number({ invalid_type_error: 'areaSqFt must be a number' }).positive('areaSqFt must be greater than 0'),
  cityTier: z.enum(['TIER_1', 'TIER_2', 'TIER_3'], {
    errorMap: () => ({ message: "cityTier must be 'TIER_1', 'TIER_2', or 'TIER_3'" })
  }),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'PLOT'], {
    errorMap: () => ({ message: "propertyType must be 'APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', or 'PLOT'" })
  })
});

export const rentAffordabilitySchema = z.object({
  monthlyIncome: z.number({ invalid_type_error: 'monthlyIncome must be a number' }).positive('monthlyIncome must be greater than 0'),
  existingEmi: z.number().nonnegative().optional().default(0)
});

export const updateRateSchema = z.object({
  state: z.string().min(2, 'state name is required'),
  stampDutyPercent: z.number().min(0, 'stampDutyPercent cannot be negative'),
  regPercent: z.number().min(0, 'regPercent cannot be negative'),
  gstPercent: z.number().min(0, 'gstPercent cannot be negative').optional().default(5.0)
});
