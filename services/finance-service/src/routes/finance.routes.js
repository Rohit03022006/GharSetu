import { Router } from 'express';
import * as financeController from '../controllers/finance.controller.js';
import { authenticateJwt, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Public Calculators
router.post('/emi', financeController.getEmi);
router.post('/stamp-duty', financeController.getStampDuty);
router.post('/gst', financeController.getGst);
router.post('/maintenance', financeController.getMaintenance);
router.post('/rent-affordability', financeController.getRentAffordability);
router.get('/rates', financeController.getAllRates);

// Admin-Only Rate Management
router.put('/rates', authenticateJwt, authorize('ADMIN'), financeController.updateRate);

export default router;
