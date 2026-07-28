import { prisma } from '../lib/prisma.js';

export const getPublicShareMetadataService = async (id) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: true }
  });

  if (!property || property.status !== 'APPROVED') {
    return null;
  }

  const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];

  return {
    id: property.id,
    title: property.title,
    description: property.description || `${property.bedrooms} BHK ${property.propertyType} in ${property.city}`,
    price: property.price,
    city: property.city,
    imageUrl: primaryImage ? primaryImage.url : null,
    openGraph: {
      ogTitle: `${property.title} | GharSetu`,
      ogDescription: `Price: ₹${property.price.toLocaleString('en-IN')} - ${property.bedrooms} BHK in ${property.city}`,
      ogImage: primaryImage ? primaryImage.url : '',
      ogUrl: `https://gharsetu.com/properties/${property.id}`
    }
  };
};
