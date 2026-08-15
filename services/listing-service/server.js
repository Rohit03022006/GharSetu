import dotenv from 'dotenv';
import app from './app.js';
import { seedDefaultProperties } from './src/services/listingSeed.service.js';
import { logger } from './src/utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 4002;

const server = app.listen(PORT, async () => {
  logger.info(`Listing Service running on port ${PORT}`);
  try {
    await seedDefaultProperties();
  } catch (err) {
    logger.error('Error during startup listing seeding:', err);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Retrying or cleanup needed.`);
  } else {
    logger.error('Server error:', err);
  }
});
