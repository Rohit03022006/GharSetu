import { prisma } from '../lib/prisma.js';

export const getInternalPropertyByIdService = async (id) => {
  return await prisma.property.findUnique({
    where: { id },
    include: { images: true, amenities: { include: { amenity: true } } }
  });
};
