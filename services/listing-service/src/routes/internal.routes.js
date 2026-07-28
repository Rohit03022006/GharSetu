import { Router } from 'express';
import * as internalController from '../controllers/internal.controller.js';

const router = Router();

// Internal inter-service endpoint for fetching property by ID
router.get('/properties/:id', internalController.getInternalPropertyById);

export default router;
