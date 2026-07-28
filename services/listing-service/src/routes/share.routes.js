import { Router } from 'express';
import * as shareController from '../controllers/share.controller.js';

const router = Router();

// Public property share link & OpenGraph metadata generator
router.get('/:id', shareController.getPublicShareMetadata);

export default router;
