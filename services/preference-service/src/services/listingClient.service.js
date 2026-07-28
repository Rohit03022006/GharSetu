import axios from 'axios';
import { getCachedProperty, cacheProperty } from '../lib/redis.js';
import { logger } from '../utils/logger.js';

const LISTING_SERVICE_URL = process.env.LISTING_SERVICE_URL || 'http://localhost:4002';

export const getPropertyDetails = async (propertyId) => {
  // 1. Try Redis cache first (2-min TTL per spec)
  const cached = await getCachedProperty(propertyId);
  if (cached) {
    return { ...cached, _source: 'Redis' };
  }

  // 2. Fetch from Listing Service internal API endpoint
  try {
    const response = await axios.get(`${LISTING_SERVICE_URL}/internal/properties/${propertyId}`, { timeout: 3000 });
    const propertyData = response.data.data || response.data;
    
    if (propertyData) {
      await cacheProperty(propertyId, propertyData, 120);
      return { ...propertyData, _source: 'ListingService' };
    }
  } catch (error) {
    logger.warn(`Failed to resolve property ${propertyId} from Listing Service:`, error.message);
  }

  return null;
};
