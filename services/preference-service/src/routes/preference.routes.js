import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { addWishlist, removeWishlist, getWishlist, compareProperties } from '../controllers/preference.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

// Wishlist endpoints
router.post('/wishlist', authenticateJwt, addWishlist);
router.delete('/wishlist/:propertyId', authenticateJwt, removeWishlist);
router.get('/wishlist', authenticateJwt, getWishlist);

// Compare properties endpoint (max 4) - accessible to public and logged in users
router.post('/compare', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'gharsetu-super-secret-jwt-access-key-2026');
    } catch (e) {
      req.user = { userId: 'guest-session' };
    }
  } else {
    req.user = { userId: 'guest-session' };
  }
  next();
}, compareProperties);

export default router;
