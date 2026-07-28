import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Execute HTTP request with Circuit Breaker pattern (Timeout + Error Handling)
 * @param {Object} config - Axios request config
 * @param {number} timeoutMs - Timeout in ms (default 3000ms per SLA)
 * @param {any} fallbackValue - Fallback return value if call fails or times out
 */
export const safeHttpRequest = async (config, timeoutMs = 3000, fallbackValue = null) => {
  try {
    const response = await axios({
      ...config,
      timeout: timeoutMs
    });
    return response.data;
  } catch (error) {
    logger.warn(`Circuit Breaker triggered for [${config.method || 'GET'}] ${config.url}:`, error.message);
    return fallbackValue;
  }
};
