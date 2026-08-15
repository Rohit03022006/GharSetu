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
      // Forward Authorization header intact
      if (srcReq.headers.authorization) {
        proxyReqOpts.headers['authorization'] = srcReq.headers.authorization;
      }
      if (srcReq.headers['x-user-id']) {
        proxyReqOpts.headers['x-user-id'] = srcReq.headers['x-user-id'];
      }
      if (srcReq.headers['x-user-role']) {
        proxyReqOpts.headers['x-user-role'] = srcReq.headers['x-user-role'];
      }
      if (srcReq.headers['x-user-email']) {
        proxyReqOpts.headers['x-user-email'] = srcReq.headers['x-user-email'];
      }
      // Never allow client-origin x-internal-service-key to pass through proxy
      delete proxyReqOpts.headers['x-internal-service-key'];
      return proxyReqOpts;
    },
    ...customOptions
  });
};
