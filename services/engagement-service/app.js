import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from './src/utils/logger.js';
import engagementRoutes from './src/routes/engagement.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Structured HTTP request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Mount Routes
app.use('/', engagementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ service: 'engagement-service', status: 'healthy', timestamp: new Date() });
});

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled Error in Engagement Service:', err);
  const status = err.status || 500;
  const code = err.code || 'SERVER_ERROR';
  res.status(status).json({
    error: {
      code,
      message: err.message || 'Internal server error'
    }
  });
});

export default app;
