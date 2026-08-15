import { Router } from 'express';
import * as listingController from '../controllers/listing.controller.js';
import { authenticateJwt, authorize } from '../middleware/auth.middleware.js';
import { requireInternalSecret } from '../middleware/internalAuth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// Public Search & Endpoints
router.get('/search', listingController.searchProperties);
router.get('/moderation/queue', authenticateJwt, authorize('ADMIN'), listingController.getModerationQueue);
router.get('/internal/:id', requireInternalSecret, listingController.getInternalPropertyById);
router.get('/:id', listingController.getPropertyById);

router.post('/check-duplicates', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), listingController.checkDuplicateListings);
router.post('/draft', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), listingController.createDraft);
router.put('/:id/autosave', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), listingController.autosaveDraft);
router.post('/:id/submit', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), listingController.submitForReview);
router.post('/:id/images', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), uploadMiddleware.single('image'), listingController.uploadPropertyImage);

// Admin Listing Moderation
router.post('/:id/approve', authenticateJwt, authorize('ADMIN'), listingController.approveProperty);
router.post('/:id/reject', authenticateJwt, authorize('ADMIN'), listingController.rejectProperty);

// Property Lifecycle Status Management (FR-PROP-03)
router.patch('/:id/status', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), listingController.updatePropertyStatus);

// Protected Buyer Reviews
router.post('/:id/reviews', authenticateJwt, authorize('BUYER'), listingController.submitReview);

export default router;
