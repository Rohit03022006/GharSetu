import { prisma } from '../lib/prisma.js';
import * as redisCache from '../lib/redis.js';
import { openSearchClient, PROPERTY_INDEX } from '../lib/opensearch.js';
import { logger } from '../utils/logger.js';

export const searchPropertiesService = async (queryParams) => {
  const {
    city, minPrice, maxPrice, bedrooms, propertyType, listingType, constructionStatus, page = 1, limit = 20
  } = queryParams;

  const cacheKey = JSON.stringify(queryParams);
  const cachedResults = await redisCache.getCachedSearchResult(cacheKey);

  if (cachedResults) {
    return { ...cachedResults, cached: true, engine: 'Redis' };
  }

  // 1. Try OpenSearch Engine first
  try {
    const mustFilters = [{ term: { status: 'APPROVED' } }];

    if (city) mustFilters.push({ match: { city } });
    if (bedrooms) mustFilters.push({ term: { bedrooms: parseInt(bedrooms) } });
    if (propertyType) mustFilters.push({ term: { propertyType } });
    if (listingType) mustFilters.push({ term: { listingType } });
    if (constructionStatus) mustFilters.push({ term: { constructionStatus } });

    if (minPrice || maxPrice) {
      const range = {};
      if (minPrice) range.gte = parseFloat(minPrice);
      if (maxPrice) range.lte = parseFloat(maxPrice);
      mustFilters.push({ range: { price: range } });
    }

    const take = parseInt(limit);
    const from = (parseInt(page) - 1) * take;

    const opensearchRes = await openSearchClient.search({
      index: PROPERTY_INDEX,
      body: {
        from,
        size: take,
        query: {
          bool: {
            must: mustFilters
          }
        }
      }
    });

    const hits = opensearchRes.body.hits.hits.map(hit => hit._source);
    const totalHits = opensearchRes.body.hits.total.value;

    const responsePayload = {
      success: true,
      engine: 'OpenSearch',
      count: hits.length,
      totalCount: totalHits,
      page: parseInt(page),
      totalPages: Math.ceil(totalHits / take),
      data: hits
    };

    await redisCache.cacheSearchResult(cacheKey, responsePayload, 300);
    return { ...responsePayload, cached: false };

  } catch (error) {
    logger.warn('OpenSearch fallback to PostgreSQL DB:', error.message);
  }

  // 2. Fallback to PostgreSQL database engine if OpenSearch is not running locally
  const where = {
    status: 'APPROVED',
    ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    ...(bedrooms ? { bedrooms: parseInt(bedrooms) } : {}),
    ...(propertyType ? { propertyType } : {}),
    ...(listingType ? { listingType } : {}),
    ...(constructionStatus ? { constructionStatus } : {}),
    ...(minPrice || maxPrice ? {
      price: {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {})
      }
    } : {})
  };

  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  const [properties, totalCount] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take,
      include: { images: true, amenities: { include: { amenity: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.property.count({ where })
  ]);

  const responsePayload = {
    success: true,
    engine: 'PostgreSQL',
    count: properties.length,
    totalCount,
    page: parseInt(page),
    totalPages: Math.ceil(totalCount / take),
    data: properties
  };

  await redisCache.cacheSearchResult(cacheKey, responsePayload, 300);
  return { ...responsePayload, cached: false };
};
