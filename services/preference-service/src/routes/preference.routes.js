import { Router } from 'express';
import { addWishlist, removeWishlist, getWishlist, compareProperties } from '../controllers/preference.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

// Wishlist endpoints
router.post('/wishlist', authenticateJwt, addWishlist);
router.delete('/wishlist/:propertyId', authenticateJwt, removeWishlist);
router.get('/wishlist', authenticateJwt, getWishlist);

// Compare properties endpoint (max 4)
router.post('/compare', authenticateJwt, compareProperties);

export default router;
