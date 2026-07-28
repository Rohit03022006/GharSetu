import { Router } from 'express';
import { logView, getRecentlyViewed, logSearch, getSearchHistory, getSimilarProperties } from '../controllers/discovery.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

// Internal/View logging endpoint (FR-REC-01, UC-DH-01)
router.post('/internal/views', authenticateJwt, logView);
router.get('/recently-viewed', authenticateJwt, getRecentlyViewed);

// Search history endpoints (FR-REC-02)
router.post('/search-history', authenticateJwt, logSearch);
router.get('/search-history', authenticateJwt, getSearchHistory);

// Similar properties rule-based matching (FR-REC-03, FR-REC-04, UC-DH-02)
router.get('/similar/:propertyId', getSimilarProperties);

export default router;
