import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './src/utils/logger.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import { initRedisSubscriber } from './src/services/pubsubListener.service.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'analytics-service' });
});

// Analytics Routes
app.use('/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled Error in Analytics Service:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  });
});

const PORT = process.env.PORT || 4006;

app.listen(PORT, () => {
  logger.info(`Analytics Service running on port ${PORT}`);
  // Initialize Redis Pub/Sub Streaming
  initRedisSubscriber();
});

export default app;
