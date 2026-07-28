import axios from 'axios';
import { logger } from '../utils/logger.js';

const LISTING_SERVICE_URL = process.env.LISTING_SERVICE_URL;

export const getPropertyOwner = async (propertyId) => {
  try {
    const response = await axios.get(`${LISTING_SERVICE_URL}/internal/properties/${propertyId}`, { timeout: 3000 });
    const propertyData = response.data.data || response.data;
    if (propertyData && propertyData.ownerId) {
      return propertyData.ownerId;
    }
  } catch (error) {
    logger.warn(`Failed to resolve owner for property ${propertyId} from Listing Service:`, error.message);
  }
  return null;
};
