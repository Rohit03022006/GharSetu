import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  listAllUsers,
  updateUserRole,
  updateUserStatus
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

// User self-service profile routes (FR-PROF-01, FR-PROF-02)
router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);

// Admin user management routes
router.get('/admin', authenticate, authorize('ADMIN'), listAllUsers);
router.patch('/admin/:userId/role', authenticate, authorize('ADMIN'), updateUserRole);
router.patch('/admin/:userId/status', authenticate, authorize('ADMIN'), updateUserStatus);

export default router;
