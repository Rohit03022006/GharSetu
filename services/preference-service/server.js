import dotenv from 'dotenv';
import app from './app.js';
import { logger } from './src/utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 4003;

const server = app.listen(PORT, () => {
  logger.info(`Preference Service running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Retrying or cleanup needed.`);
  } else {
    logger.error('Server error:', err);
  }
});
