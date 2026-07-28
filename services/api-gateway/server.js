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

// Microservice Target Ports (Strict Alignment)
const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL;
const FINANCE_URL = process.env.FINANCE_SERVICE_URL;
const LISTING_URL = process.env.LISTING_SERVICE_URL;
const PREFERENCE_URL = process.env.PREFERENCE_SERVICE_URL ;
const DISCOVERY_URL = process.env.DISCOVERY_SERVICE_URL;
const ENGAGEMENT_URL = process.env.ENGAGEMENT_SERVICE_URL;
const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL;

// 1. Identity Service Route (Port 4001)
app.use('/auth', authRateLimiter, createServiceProxy(IDENTITY_URL, {
  proxyReqPathResolver: (req) => '/auth' + req.url
}));

// 2. Finance Service Route (Port 4002)
app.use('/finance', createServiceProxy(FINANCE_URL, {
  proxyReqPathResolver: (req) => '/finance' + req.url
}));

// 3. Listing Service Routes (Port 4003)
app.use('/properties', createServiceProxy(LISTING_URL, {
  proxyReqPathResolver: (req) => '/properties' + req.url
}));
app.use('/search', createServiceProxy(LISTING_URL, {
  proxyReqPathResolver: (req) => '/search' + req.url
}));
app.use('/internal', createServiceProxy(LISTING_URL, {
  proxyReqPathResolver: (req) => '/internal' + req.url
}));
app.use('/share', createServiceProxy(LISTING_URL, {
  proxyReqPathResolver: (req) => '/share' + req.url
}));

// 4. Preference Service Route (Port 4004)
app.use('/preferences', createServiceProxy(PREFERENCE_URL));
app.use('/wishlist', createServiceProxy(PREFERENCE_URL, {
  proxyReqPathResolver: (req) => '/wishlist' + req.url
}));

// 5. Discovery & Search Service Route (Port 4005)
app.use('/discovery', createServiceProxy(DISCOVERY_URL));

// 6. Engagement Service Route (Port 4006)
app.use('/availability', createServiceProxy(ENGAGEMENT_URL, {
  proxyReqPathResolver: (req) => '/availability' + req.url
}));
app.use('/bookings', createServiceProxy(ENGAGEMENT_URL));
app.use('/leads', createServiceProxy(ENGAGEMENT_URL, {
  proxyReqPathResolver: (req) => '/leads' + req.url
}));
app.use('/notifications', createServiceProxy(ENGAGEMENT_URL, {
  proxyReqPathResolver: (req) => '/notifications' + req.url
}));

// 7. Analytics Service Route (Port 4007)
app.use('/analytics', createServiceProxy(ANALYTICS_URL, {
  proxyReqPathResolver: (req) => '/analytics' + req.url
}));

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
  logger.info(`Proxying Identity (4001), Finance (4002), Listing (4003), Preference (4004), Discovery (4005), Engagement (4006), Analytics (4007)`);
});

export default app;
