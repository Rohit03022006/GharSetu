import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient({
  log: ['error', 'warn']
});

prisma.$connect()
  .then(() => logger.info('Connected to PostgreSQL Database (engagement_db)'))
  .catch((err) => logger.error('Failed to connect to engagement_db:', err));
