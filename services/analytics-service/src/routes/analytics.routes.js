import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.middleware.js';
import { getBuilderDashboardHandler, getAdminDashboardHandler } from '../controllers/analytics.controller.js';

const router = express.Router();

// Builder / Seller Dashboard Analytics (FR-ANLY-02, UC-AS-01)
router.get(
  '/builder/dashboard',
  authenticate,
  authorizeRole('SELLER', 'BROKER', 'BUILDER', 'ADMIN'),
  getBuilderDashboardHandler
);

// Admin Platform Dashboard Analytics (FR-ANLY-03, UC-AS-03)
router.get(
  '/admin/dashboard',
  authenticate,
  authorizeRole('ADMIN'),
  getAdminDashboardHandler
);

export default router;
