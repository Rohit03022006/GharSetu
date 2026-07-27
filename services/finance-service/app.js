import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import financeRoutes from './src/routes/finance.routes.js';
import { logger } from './src/utils/logger.js';

const app = express();

app.use(cors());
app.use(express.json());

// Production Structured HTTP Request Logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Routes
app.use('/finance', financeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'finance-service', status: 'healthy', timestamp: new Date() });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Error in Finance Service:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    }
  });
});

export default app;
