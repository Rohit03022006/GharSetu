import dotenv from 'dotenv';
import app from './app.js';
import { seedDefaultAdmin } from './src/services/adminSeed.service.js';
import { logger } from './src/utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 4001;

app.listen(PORT, async () => {
  logger.info(`Identity Service running on port ${PORT}`);
  try {
    await seedDefaultAdmin();
  } catch (error) {
    logger.error('Failed to run initial admin auto-seed script:', error);
  }
});
