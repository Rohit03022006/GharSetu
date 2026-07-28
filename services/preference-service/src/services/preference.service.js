import { prisma } from '../lib/prisma.js';
import { getPropertyDetails } from './listingClient.service.js';

export const addToWishlist = async (userId, propertyId, notes) => {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_propertyId: { userId, propertyId } }
  });

  if (existing) {
    return { wishlist: existing, isNew: false };
  }

  const wishlist = await prisma.wishlist.create({
    data: { userId, propertyId, notes }
  });

  return { wishlist, isNew: true };
};

export const removeFromWishlist = async (userId, propertyId) => {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_propertyId: { userId, propertyId } }
  });

  if (!existing) {
    return false;
  }

  await prisma.wishlist.delete({
    where: { userId_propertyId: { userId, propertyId } }
  });

  return true;
};

export const getUserWishlist = async (userId) => {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  // Resolve property metadata via Listing Service with Redis cache
  const populated = await Promise.all(
    items.map(async (item) => {
      const property = await getPropertyDetails(item.propertyId);
      return {
        id: item.id,
        propertyId: item.propertyId,
        notes: item.notes,
        addedAt: item.createdAt,
        property: property || { id: item.propertyId, unavailable: true }
      };
    })
  );

  return populated;
};

export const compareProperties = async (userId, propertyIds) => {
  // Save comparison session to compare_histories log
  await prisma.compareHistory.create({
    data: { userId, propertyIds }
  });

  // Resolve metadata for all target properties (max 4)
  const properties = await Promise.all(
    propertyIds.map(async (id) => {
      const details = await getPropertyDetails(id);
      return details || { id, unavailable: true };
    })
  );

  return properties;
};
