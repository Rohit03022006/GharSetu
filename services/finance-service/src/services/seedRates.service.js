import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

const DEFAULT_RATES = [
  { state: 'MAHARASHTRA', stampDutyPercent: 6.0, regPercent: 1.0, gstPercent: 5.0 },
  { state: 'DELHI', stampDutyPercent: 6.0, regPercent: 1.0, gstPercent: 5.0 },
  { state: 'KARNATAKA', stampDutyPercent: 5.0, regPercent: 1.0, gstPercent: 5.0 },
  { state: 'HARYANA', stampDutyPercent: 7.0, regPercent: 1.0, gstPercent: 5.0 },
  { state: 'TAMIL_NADU', stampDutyPercent: 7.0, regPercent: 4.0, gstPercent: 5.0 },
  { state: 'TELANGANA', stampDutyPercent: 4.0, regPercent: 0.5, gstPercent: 5.0 },
  { state: 'UTTAR_PRADESH', stampDutyPercent: 7.0, regPercent: 1.0, gstPercent: 5.0 },
  { state: 'WEST_BENGAL', stampDutyPercent: 6.0, regPercent: 1.0, gstPercent: 5.0 }
];

export const seedDefaultRates = async () => {
  try {
    for (const rate of DEFAULT_RATES) {
      await prisma.financeRate.upsert({
        where: { state: rate.state },
        update: {},
        create: rate
      });
    }
    logger.info('Finance rates auto-seeded for 8 major states.');
  } catch (error) {
    logger.error('Failed to auto-seed finance rates:', error);
  }
};
