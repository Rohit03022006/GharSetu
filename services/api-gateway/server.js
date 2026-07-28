import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './src/utils/logger.js';
import { globalRateLimiter, authRateLimiter } from './src/middleware/rateLimit.middleware.js';
import { validateGatewayJwt } from './src/middleware/auth.middleware.js';
import { createServiceProxy } from './src/utils/proxy.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(globalRateLimiter);
app.use(validateGatewayJwt);

// Health check endpoint for Gateway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Microservice Route Proxies
const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4001';
const LISTING_URL = process.env.LISTING_SERVICE_URL || 'http://localhost:4002';
const PREFERENCE_URL = process.env.PREFERENCE_SERVICE_URL || 'http://localhost:4003';
const DISCOVERY_URL = process.env.DISCOVERY_SERVICE_URL || 'http://localhost:4004';
const ENGAGEMENT_URL = process.env.ENGAGEMENT_SERVICE_URL || 'http://localhost:4005';
const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4006';

// 1. Identity Service Route
app.use('/auth', authRateLimiter, createServiceProxy(IDENTITY_URL));

// 2. Listing Service Route
app.use('/properties', createServiceProxy(LISTING_URL));

// 3. Preference Service Route
app.use('/preferences', createServiceProxy(PREFERENCE_URL));

// 4. Discovery & Search Service Route
app.use('/discovery', createServiceProxy(DISCOVERY_URL));

// 5. Engagement Service Route (Bookings, Leads, Notifications)
app.use('/availability', createServiceProxy(ENGAGEMENT_URL));
app.use('/bookings', createServiceProxy(ENGAGEMENT_URL));
app.use('/leads', createServiceProxy(ENGAGEMENT_URL));
app.use('/notifications', createServiceProxy(ENGAGEMENT_URL));

// 6. Analytics Service Route (Builder & Admin Dashboards)
app.use('/analytics', createServiceProxy(ANALYTICS_URL));

// 404 Handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl} - API Gateway route not found`
    }
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`GharSetu API Gateway running on port ${PORT}`);
  logger.info(`Proxying requests to Identity (${IDENTITY_URL}), Listing (${LISTING_URL}), Preference (${PREFERENCE_URL}), Discovery (${DISCOVERY_URL}), Engagement (${ENGAGEMENT_URL}), Analytics (${ANALYTICS_URL})`);
});

export default app;
