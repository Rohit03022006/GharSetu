import { Router } from 'express';
import * as propertyController from '../controllers/property.controller.js';
import { authenticateJwt, authorize } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// Draft & Autosave (Builder / Broker / Admin)
router.post('/draft', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), propertyController.createDraft);
router.put('/:id/autosave', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), propertyController.autosaveDraft);
router.post('/:id/submit', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), propertyController.submitForReview);

// Image Uploads (Multer -> Sharp WEBP -> MinIO)
router.post('/:id/images', authenticateJwt, authorize('BUILDER', 'BROKER', 'ADMIN'), uploadMiddleware.single('image'), propertyController.uploadPropertyImage);

// Admin Moderation (Approve / Reject)
router.post('/:id/approve', authenticateJwt, authorize('ADMIN'), propertyController.approveProperty);
router.post('/:id/reject', authenticateJwt, authorize('ADMIN'), propertyController.rejectProperty);

export default router;
