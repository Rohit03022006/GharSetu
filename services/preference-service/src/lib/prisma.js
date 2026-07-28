import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient({
  log: ['error', 'warn']
});

prisma.$connect()
  .then(() => logger.info('Connected to PostgreSQL Database (preference_db)'))
  .catch((err) => logger.error('Failed to connect to preference_db:', err));
