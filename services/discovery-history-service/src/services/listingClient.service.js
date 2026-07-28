import axios from 'axios';
import { getCachedProperty, cacheProperty } from '../lib/redis.js';
import { logger } from '../utils/logger.js';

const LISTING_SERVICE_URL = process.env.LISTING_SERVICE_URL ;

export const getPropertyDetails = async (propertyId) => {
  // 1. Try Redis cache first (2-min TTL)
  const cached = await getCachedProperty(propertyId);
  if (cached) {
    return { ...cached, _source: 'Redis' };
  }

  // 2. Query Listing Service internal API endpoint
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

export const searchSimilarPropertiesFromListingService = async (queryParams) => {
  try {
    const response = await axios.get(`${LISTING_SERVICE_URL}/search`, {
      params: queryParams,
      timeout: 3000
    });
    return response.data?.data || [];
  } catch (error) {
    logger.warn('Failed to fetch similar properties from Listing Service search:', error.message);
    return [];
  }
};
