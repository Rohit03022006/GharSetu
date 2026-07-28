import { Router } from 'express';
import * as listingController from '../controllers/listing.controller.js';
import { authenticateJwt, authorize } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// Public Search & Internal Endpoints
router.get('/search', listingController.searchProperties);
router.get('/internal/:id', listingController.getInternalPropertyById);

// Protected Builder / Broker / Admin Listing Management
router.post('/draft', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), listingController.createDraft);
router.put('/:id/autosave', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), listingController.autosaveDraft);
router.post('/:id/submit', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), listingController.submitForReview);
router.post('/:id/images', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), uploadMiddleware.single('image'), listingController.uploadPropertyImage);

// Admin Listing Moderation
router.post('/:id/approve', authenticateJwt, authorize('ADMIN'), listingController.approveProperty);
router.post('/:id/reject', authenticateJwt, authorize('ADMIN'), listingController.rejectProperty);

// Protected Buyer Reviews
router.post('/:id/reviews', authenticateJwt, authorize('BUYER'), listingController.submitReview);

export default router;
