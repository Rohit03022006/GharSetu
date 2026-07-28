import { safeHttpRequest } from '../lib/circuitBreaker.js';

export const verifyBookingCompleted = async (propertyId, buyerId) => {
  const engagementUrl = process.env.ENGAGEMENT_SERVICE_URL;
  const result = await safeHttpRequest({
    method: 'GET',
    url: `${engagementUrl}/internal/bookings/verify-completed`,
    params: { propertyId, buyerId }
  }, 3000, null);

  return result?.data?.verified === true;
};


