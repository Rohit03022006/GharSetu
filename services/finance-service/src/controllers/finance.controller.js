import { prisma } from '../lib/prisma.js';
import * as validator from '../validators/finance.validators.js';
import * as calculator from '../services/financeCalculator.service.js';

export const getEmi = async (req, res, next) => {
  try {
    const validated = validator.emiSchema.parse(req.body);
    const result = calculator.calculateEmi(validated.loanAmount, validated.annualInterestRate, validated.tenureYears);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getStampDuty = async (req, res, next) => {
  try {
    const validated = validator.stampDutySchema.parse(req.body);
    const stateName = validated.state.trim().toUpperCase().replace(/\s+/g, '_');

    // Fetch state rates from DB or fallback to default
    let rateRecord = await prisma.financeRate.findUnique({
      where: { state: stateName }
    });

    if (!rateRecord) {
      // Fallback rate if state not found
      rateRecord = { stampDutyPercent: 6.0, regPercent: 1.0 };
    }

    const result = calculator.calculateStampDuty(validated.propertyPrice, rateRecord.stampDutyPercent, rateRecord.regPercent);
    res.json({ success: true, state: stateName, data: result });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getGst = async (req, res, next) => {
  try {
    const validated = validator.gstSchema.parse(req.body);
    let gstRate = 5.0;

    if (validated.state) {
      const stateName = validated.state.trim().toUpperCase().replace(/\s+/g, '_');
      const rateRecord = await prisma.financeRate.findUnique({ where: { state: stateName } });
      if (rateRecord) {
        gstRate = rateRecord.gstPercent;
      }
    }

    const result = calculator.calculateGst(validated.propertyPrice, validated.constructionStatus, gstRate);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getMaintenance = async (req, res, next) => {
  try {
    const validated = validator.maintenanceSchema.parse(req.body);
    const result = calculator.calculateMaintenance(validated.areaSqFt, validated.cityTier, validated.propertyType);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getRentAffordability = async (req, res, next) => {
  try {
    const validated = validator.rentAffordabilitySchema.parse(req.body);
    const result = calculator.calculateRentAffordability(validated.monthlyIncome, validated.existingEmi);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

export const getAllRates = async (req, res, next) => {
  try {
    const rates = await prisma.financeRate.findMany({
      orderBy: { state: 'asc' }
    });
    res.json({ success: true, count: rates.length, data: rates });
  } catch (error) {
    next(error);
  }
};

export const updateRate = async (req, res, next) => {
  try {
    const validated = validator.updateRateSchema.parse(req.body);
    const stateName = validated.state.trim().toUpperCase().replace(/\s+/g, '_');

    const updated = await prisma.financeRate.upsert({
      where: { state: stateName },
      update: {
        stampDutyPercent: validated.stampDutyPercent,
        regPercent: validated.regPercent,
        gstPercent: validated.gstPercent
      },
      create: {
        state: stateName,
        stampDutyPercent: validated.stampDutyPercent,
        regPercent: validated.regPercent,
        gstPercent: validated.gstPercent
      }
    });

    res.json({ success: true, message: `Finance rates updated for state ${stateName}`, data: updated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};
