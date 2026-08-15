import { Router } from 'express';
import {
  createAvailability,
  getAvailability,
  createBooking,
  cancelBooking,
  rescheduleBooking,
  getLeads,
  updateLeadStage,
  verifyCompletedBookingInternal,
  getNotifications,
  getMyBookings
} from '../controllers/engagement.controller.js';
import { authenticateJwt, requireRole } from '../middleware/auth.middleware.js';
import { requireInternalSecret } from '../middleware/internalAuth.middleware.js';

const router = Router();

// Internal route for Listing Service booking verification (FR-REV-01)
router.get('/internal/bookings/verify-completed', requireInternalSecret, verifyCompletedBookingInternal);

// Availability slots management (FR-BOOK-01, UC-ES-01)
router.post('/availability', authenticateJwt, requireRole(['SELLER', 'BROKER', 'BUILDER', 'ADMIN']), createAvailability);
router.get('/availability/:propertyId', getAvailability);

// Booking Lifecycle Endpoints (FR-BOOK-02, FR-BOOK-03, FR-BOOK-04, UC-ES-02, UC-ES-03)
router.get('/bookings/my-bookings', authenticateJwt, getMyBookings);
router.post('/bookings', authenticateJwt, createBooking);
router.post('/bookings/:bookingId/cancel', authenticateJwt, cancelBooking);
router.post('/bookings/:bookingId/reschedule', authenticateJwt, rescheduleBooking);

// Lead & Lead Stage Management (FR-LEAD-02, FR-LEAD-03, UC-ES-04)
router.get('/leads', authenticateJwt, getLeads);
router.patch('/leads/:leadId/stage', authenticateJwt, updateLeadStage);

// Notifications endpoint
router.get('/notifications', authenticateJwt, getNotifications);

export default router;
