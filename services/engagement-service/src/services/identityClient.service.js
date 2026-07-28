import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Fetch User Email from Identity Service via internal lookup
 */
export const getUserEmail = async (userId) => {
  try {
    const identityUrl = process.env.IDENTITY_SERVICE_URL;
    const response = await axios.get(`${identityUrl}/auth/internal/user-status/${userId}`, {
      timeout: 3000
    });
    return response.data?.email || null;
  } catch (error) {
    logger.warn(`Could not fetch email for user ${userId} from Identity Service:`, error.message);
    return null;
  }
};
