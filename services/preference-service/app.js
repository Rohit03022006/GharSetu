import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from './src/utils/logger.js';
import preferenceRoutes from './src/routes/preference.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Structured HTTP request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Mount Routes
app.use('/', preferenceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ service: 'preference-service', status: 'healthy', timestamp: new Date() });
});

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled Error in Preference Service:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    }
  });
});

export default app;
