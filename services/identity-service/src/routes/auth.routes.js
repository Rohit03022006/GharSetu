import { Router } from 'express';
import passport from 'passport';
import { register, login, refresh, logout, googleCallbackHandler, verifyEmailOTP, resendEmailOTP, forgotPassword, resetPasswordWithOTP } from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/verify-otp', authRateLimiter, verifyEmailOTP);
router.post('/resend-otp', authRateLimiter, resendEmailOTP);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPasswordWithOTP);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  const mode = req.query.mode || 'login';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: JSON.stringify({ mode })
  })(req, res, next);
});

router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallbackHandler);

export default router;
