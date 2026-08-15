import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Optional Gateway Auth Validation
 * Validates JWT header if present and attaches decoded user to proxy request
 */
export const validateGatewayJwt = (req, res, next) => {
  // Strip untrusted client-supplied identity & internal headers to prevent spoofing
  delete req.headers['x-user-id'];
  delete req.headers['x-user-role'];
  delete req.headers['x-user-email'];
  delete req.headers['x-internal-service-key'];

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'gharsetu-super-secret-jwt-access-key-2026';
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      req.headers['x-user-id'] = decoded.userId || decoded.id;
      req.headers['x-user-role'] = decoded.role;
      req.headers['x-user-email'] = decoded.email;
    } catch (err) {
      logger.warn(`[Gateway JWT Warning] Invalid token provided: ${err.message}`);
    }
  }
  next();
};
