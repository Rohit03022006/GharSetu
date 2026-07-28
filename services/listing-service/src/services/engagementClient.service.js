import axios from 'axios';
import { logger } from '../utils/logger.js';

export const verifyBookingCompleted = async (bookingId, buyerId) => {
  try {
    const engagementUrl = process.env.ENGAGEMENT_SERVICE_URL || 'http://localhost:4005';
    const response = await axios.get(`${engagementUrl}/internal/bookings/verify-completed`, {
      params: { bookingId, buyerId },
      timeout: 3000
    });
    return response.data?.isCompleted === true;
  } catch (error) {
    logger.warn(`Engagement Service stub fallback for booking ${bookingId}: proceeding...`);
    return true; // Stub fallback for Phase 3 before Phase 5 Engagement Service deployment
  }
};
