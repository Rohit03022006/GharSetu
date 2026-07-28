import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';

const router = Router();

// Public filtered search endpoint with Redis caching
router.get('/', searchController.searchProperties);

export default router;
