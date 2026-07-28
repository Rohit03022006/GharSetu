import proxy from 'express-http-proxy';
import { logger } from '../utils/logger.js';

/**
 * Configure reverse proxy route for a microservice
 */
export const createServiceProxy = (targetUrl, customOptions = {}) => {
  return proxy(targetUrl, {
    proxyErrorHandler: (err, res, next) => {
      logger.error(`[API Gateway Error] Failed to route request to ${targetUrl}:`, err.message);
      res.status(503).json({
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `Target service at ${targetUrl} is currently unavailable`
        }
      });
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Forward Authorization headers intact
      if (srcReq.headers.authorization) {
        proxyReqOpts.headers['authorization'] = srcReq.headers.authorization;
      }
      return proxyReqOpts;
    },
    ...customOptions
  });
};
