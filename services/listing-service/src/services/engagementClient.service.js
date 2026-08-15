import { safeHttpRequest } from '../lib/circuitBreaker.js';

export const verifyBookingCompleted = async (propertyId, buyerId) => {
  const engagementUrl = process.env.ENGAGEMENT_SERVICE_URL;
  const internalKey = process.env.INTERNAL_SERVICE_KEY || 'gharsetu-internal-microservice-secure-key-2026';
  const result = await safeHttpRequest({
    method: 'GET',
    url: `${engagementUrl}/internal/bookings/verify-completed`,
    params: { propertyId, buyerId },
    headers: {
      'x-internal-service-key': internalKey
    }
  }, 3000, null);

  return result?.data?.verified === true;
};


