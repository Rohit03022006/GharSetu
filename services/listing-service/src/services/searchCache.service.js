import * as redisCache from '../lib/redis.js';

export const cacheSearchResult = async (key, data, ttlSeconds = 300) => {
  return await redisCache.cacheSearchResult(key, data, ttlSeconds);
};

export const getCachedSearchResult = async (key) => {
  return await redisCache.getCachedSearchResult(key);
};

export const invalidateSearchCache = async () => {
  return await redisCache.invalidateSearchCache();
};
