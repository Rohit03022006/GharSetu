import dotenv from 'dotenv';
import app from './app.js';
import { seedDefaultRates } from './src/services/seedRates.service.js';
import { logger } from './src/utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 4003;

app.listen(PORT, async () => {
  logger.info(`Finance Service running on port ${PORT}`);
  try {
    await seedDefaultRates();
  } catch (error) {
    logger.error('Failed to run initial state rate auto-seed script:', error);
  }
});
