import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import { prisma } from './src/lib/prisma.js';
import { configureGoogleOAuth } from './src/services/oauth.service.js';
import { logger } from './src/utils/logger.js';
import authRoutes from './src/routes/auth.routes.js';
import verificationRoutes from './src/routes/verification.routes.js';

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

// Initialize Passport & OAuth
app.use(passport.initialize());
configureGoogleOAuth(prisma);

// Routes
app.use('/auth', authRoutes);
app.use('/admin/verifications', verificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ service: 'identity-service', status: 'healthy', timestamp: new Date() });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    }
  });
});

export default app;
