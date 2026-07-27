import { Router } from 'express';
import { getPendingVerifications, approveVerification, rejectVerification, submitVerificationDoc } from '../controllers/verification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

// Submit verification document (Broker/Builder)
router.post('/documents', authenticate, authorize('BROKER', 'BUILDER'), submitVerificationDoc);

// Admin moderation endpoints
router.get('/pending', authenticate, authorize('ADMIN'), getPendingVerifications);
router.post('/:userId/approve', authenticate, authorize('ADMIN'), approveVerification);
router.post('/:userId/reject', authenticate, authorize('ADMIN'), rejectVerification);

export default router;
