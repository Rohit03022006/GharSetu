import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticateJwt, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Buyer Review Submission
router.post('/property/:id', authenticateJwt, authorize('BUYER'), reviewController.submitReview);

// Owner Reply
router.post('/:reviewId/reply', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), reviewController.replyToReview);

// Admin Moderation
router.patch('/:reviewId/moderate', authenticateJwt, authorize('ADMIN'), reviewController.moderateReview);

export default router;
