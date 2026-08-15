import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

const defaultProperties = [
  {
    title: "4 BHK Ultra Luxury Sea View Penthouse Bandra",
    description: "Experience panoramic Arabian Sea views with this ultra-luxurious 4 BHK penthouse on Carter Road. Comes with private deck, Italian marble flooring, and smart home automation.",
    ownerId: "builder-dlf-101",
    ownerRole: "BUILDER",
    listingType: "SALE",
    propertyType: "APARTMENT",
    constructionStatus: "READY_TO_MOVE",
    furnishingStatus: "FULLY_FURNISHED",
    price: 185000000,
    areaSqFt: 4200,
    bedrooms: 4,
    bathrooms: 5,
    parkingSlots: 3,
    address: "Carter Road, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    latitude: 19.0596,
    longitude: 72.8258,
    metroProximity: false,
    status: "APPROVED",
    avgRating: 4.9,
    totalReviews: 24,
    images: [
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        key: "mumbai-penthouse-1",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        key: "mumbai-penthouse-2",
        isPrimary: false
      }
    ]
  },
  {
    title: "3 BHK Premium High-Rise Sky Residence Vasant Kunj",
    description: "Vastu compliant 3 BHK luxury apartment overlooking lush green ridge area. Gated community with clubhouse, tennis court, and Olympic size swimming pool.",
    ownerId: "broker-metro-201",
    ownerRole: "BROKER",
    listingType: "SALE",
    propertyType: "APARTMENT",
    constructionStatus: "READY_TO_MOVE",
    furnishingStatus: "SEMI_FURNISHED",
    price: 14500000,
    areaSqFt: 1850,
    bedrooms: 3,
    bathrooms: 3,
    parkingSlots: 2,
    address: "Pocket 2, Sector C, Vasant Kunj",
    city: "Delhi",
    state: "Delhi",
    pincode: "110070",
    latitude: 28.5284,
    longitude: 77.1517,
    metroProximity: true,
    status: "APPROVED",
    avgRating: 4.8,
    totalReviews: 16,
    images: [
      {
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
        key: "delhi-residence-1",
        isPrimary: true
      }
    ]
  },
  {
    title: "3 BHK Contemporary Garden Villa Whitefield",
    description: "Exquisite private villa in a serene gated township near ITPL. Private lawn, solar water heater, EV charging bay, and top-tier security.",
    ownerId: "builder-dlf-101",
    ownerRole: "BUILDER",
    listingType: "SALE",
    propertyType: "VILLA",
    constructionStatus: "READY_TO_MOVE",
    furnishingStatus: "FULLY_FURNISHED",
    price: 21000000,
    areaSqFt: 2600,
    bedrooms: 3,
    bathrooms: 4,
    parkingSlots: 2,
    address: "Channasandra Main Road, Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560066",
    latitude: 12.9698,
    longitude: 77.7499,
    metroProximity: true,
    status: "APPROVED",
    avgRating: 4.9,
    totalReviews: 19,
    images: [
      {
        url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
        key: "blr-villa-1",
        isPrimary: true
      }
    ]
  },
  {
    "title": "2 BHK Modern Executive Apartment Sector 62",
    description: "Well-lit 2 BHK apartment 5 minutes walking distance from Electronic City metro station. Modular kitchen, high-speed fiber internet ready.",
    ownerId: "broker-metro-201",
    ownerRole: "BROKER",
    listingType: "RENT",
    propertyType: "APARTMENT",
    constructionStatus: "READY_TO_MOVE",
    furnishingStatus: "SEMI_FURNISHED",
    price: 32000,
    securityDeposit: 64000,
    leaseDurationMonths: 11,
    areaSqFt: 1150,
    bedrooms: 2,
    bathrooms: 2,
    parkingSlots: 1,
    address: "B-Block, Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201309",
    latitude: 28.627,
    longitude: 77.372,
    metroProximity: true,
    status: "APPROVED",
    avgRating: 4.7,
    totalReviews: 11,
    images: [
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        key: "noida-apt-1",
        isPrimary: true
      }
    ]
  },
  {
    title: "4 BHK Smart Home Condominium Golf Course Road",
    description: "Ultra-prime residential condominium on Golf Course Road with dedicated concierge service, rooftop infinity pool, and biometric elevator access.",
    ownerId: "builder-dlf-101",
    ownerRole: "BUILDER",
    listingType: "RENT",
    propertyType: "APARTMENT",
    constructionStatus: "READY_TO_MOVE",
    furnishingStatus: "FULLY_FURNISHED",
    price: 125000,
    securityDeposit: 375000,
    leaseDurationMonths: 12,
    areaSqFt: 3400,
    bedrooms: 4,
    bathrooms: 4,
    parkingSlots: 2,
    address: "Sector 54, Golf Course Road",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    latitude: 28.4418,
    longitude: 77.1065,
    metroProximity: true,
    status: "APPROVED",
    avgRating: 4.9,
    totalReviews: 28,
    images: [
      {
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        key: "gurugram-condo-1",
        isPrimary: true
      }
    ]
  },
  {
    title: "3 BHK Serene Riverfront Residence Koregaon Park",
    description: "Surrounded by greenery and heritage banyan trees. Features double height balconies, clubhouse with squash court, and yoga deck.",
    ownerId: "broker-metro-201",
    ownerRole: "BROKER",
    listingType: "SALE",
    propertyType: "APARTMENT",
    constructionStatus: "READY_TO_MOVE",
    furnishingStatus: "FULLY_FURNISHED",
    price: 18500000,
    areaSqFt: 1950,
    bedrooms: 3,
    bathrooms: 3,
    parkingSlots: 2,
    address: "Lane 7, Koregaon Park",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    latitude: 18.5362,
    longitude: 73.8958,
    metroProximity: false,
    status: "APPROVED",
    avgRating: 4.8,
    totalReviews: 14,
    images: [
      {
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        key: "pune-residence-1",
        isPrimary: true
      }
    ]
  }
];

export const seedDefaultProperties = async () => {
  try {
    const existingCount = await prisma.property.count();
    if (existingCount === 0) {
      logger.info('[Seed] Initializing default seed properties in listing_db...');
      for (const p of defaultProperties) {
        const { images, ...propertyData } = p;
        await prisma.property.create({
          data: {
            ...propertyData,
            images: {
              create: images
            }
          }
        });
      }
      logger.info(`[Seed] Successfully seeded ${defaultProperties.length} verified properties!`);
    }
  } catch (error) {
    logger.error('Failed to auto-seed properties:', error);
  }
};
