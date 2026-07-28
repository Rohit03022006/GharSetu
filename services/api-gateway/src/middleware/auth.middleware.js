import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Optional Gateway Auth Validation
 * Validates JWT header if present and attaches decoded user to proxy request
 */
export const validateGatewayJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gharsetu-super-secret-jwt-access-key-2026');
      req.user = decoded;
      req.headers['x-user-id'] = decoded.userId;
      req.headers['x-user-role'] = decoded.role;
    } catch (err) {
      logger.warn(`[Gateway JWT Warning] Invalid token provided: ${err.message}`);
    }
  }
  next();
};
