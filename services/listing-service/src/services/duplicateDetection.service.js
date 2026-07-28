import { prisma } from '../lib/prisma.js';

export const checkDuplicateListing = async (address, price, areaSqFt, latitude, longitude) => {
  const minPrice = price * 0.95;
  const maxPrice = price * 1.05;

  const duplicates = await prisma.property.findMany({
    where: {
      status: { in: ['PENDING', 'APPROVED'] },
      price: { gte: minPrice, lte: maxPrice },
      areaSqFt: { gte: areaSqFt * 0.9, lte: areaSqFt * 1.1 },
      OR: [
        { address: { contains: address, mode: 'insensitive' } },
        ...(latitude && longitude ? [{
          latitude: { gte: latitude - 0.001, lte: latitude + 0.001 },
          longitude: { gte: longitude - 0.001, lte: longitude + 0.001 }
        }] : [])
      ]
    },
    select: { id: true, title: true, address: true, price: true }
  });

  return {
    isPossibleDuplicate: duplicates.length > 0,
    matchedProperties: duplicates
  };
};
