import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import listingRoutes from './src/routes/listing.routes.js';
import searchRoutes from './src/routes/search.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import internalRoutes from './src/routes/internal.routes.js';
import shareRoutes from './src/routes/share.routes.js';
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

// Dedicated Modular Routes
app.use('/properties', listingRoutes);
app.use('/search', searchRoutes);
app.use('/reviews', reviewRoutes);
app.use('/internal', internalRoutes);
app.use('/share', shareRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'listing-service', status: 'healthy', timestamp: new Date() });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Error in Listing Service:', {
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
