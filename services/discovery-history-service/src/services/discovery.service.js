import { prisma } from '../lib/prisma.js';
import { getPropertyDetails, searchSimilarPropertiesFromListingService } from './listingClient.service.js';

export const logPropertyView = async (userId, propertyId) => {
  // 1. Log view record to DB
  await prisma.propertyView.create({
    data: { userId, propertyId }
  });

  // 2. Enforce Capped 20 Recent Views per user in DB
  const userViews = await prisma.propertyView.findMany({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    select: { id: true }
  });

  if (userViews.length > 20) {
    const toDeleteIds = userViews.slice(20).map(v => v.id);
    await prisma.propertyView.deleteMany({
      where: { id: { in: toDeleteIds } }
    });
  }

  return { propertyId, viewedAt: new Date() };
};

export const getRecentlyViewed = async (userId) => {
  const views = await prisma.propertyView.findMany({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    take: 20
  });

  // Deduplicate recently viewed property IDs preserving view order
  const uniquePropertyIds = [...new Set(views.map(v => v.propertyId))];

  const populated = await Promise.all(
    uniquePropertyIds.map(async (propertyId) => {
      const details = await getPropertyDetails(propertyId);
      return details || { id: propertyId, unavailable: true };
    })
  );

  return populated;
};

export const logSearchHistory = async (userId, filters) => {
  const searchLog = await prisma.searchHistory.create({
    data: { userId, filters }
  });
  return searchLog;
};

export const getSearchHistory = async (userId) => {
  return await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
};

export const getSimilarProperties = async (propertyId) => {
  // 1. Fetch current target property details
  const targetProperty = await getPropertyDetails(propertyId);
  if (!targetProperty) {
    return [];
  }

  // 2. Rule-based matching: Same city, propertyType, ±20% price range
  const minPrice = targetProperty.price ? targetProperty.price * 0.8 : undefined;
  const maxPrice = targetProperty.price ? targetProperty.price * 1.2 : undefined;

  const searchParams = {
    city: targetProperty.city,
    propertyType: targetProperty.propertyType,
    ...(minPrice ? { minPrice } : {}),
    ...(maxPrice ? { maxPrice } : {}),
    limit: 10
  };

  const results = await searchSimilarPropertiesFromListingService(searchParams);

  // Filter out the reference property itself
  return results.filter(p => p.id !== propertyId);
};
