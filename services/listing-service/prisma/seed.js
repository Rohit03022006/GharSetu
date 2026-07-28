import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial properties into PostgreSQL (listing_db)...');

  const p1 = await prisma.property.create({
    data: {
      title: '3 BHK Ultra-Luxury Apartment Sector 62',
      description: 'Spacious 3 BHK apartment with modern amenities, 24/7 security, and close proximity to Metro Station.',
      ownerId: 'builder-101',
      ownerRole: 'BUILDER',
      listingType: 'SALE',
      propertyType: 'APARTMENT',
      constructionStatus: 'READY_TO_MOVE',
      furnishingStatus: 'FULLY_FURNISHED',
      price: 8500000,
      areaSqFt: 1450,
      bedrooms: 3,
      bathrooms: 3,
      parkingSlots: 2,
      address: 'Plot 4, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      latitude: 28.627,
      longitude: 77.372,
      metroProximity: true,
      status: 'APPROVED',
      approvedBy: 'admin-01',
      approvedAt: new Date(),
      avgRating: 4.8,
      totalReviews: 12,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
            key: 'img-1',
            isPrimary: true
          }
        ]
      }
    }
  });

  const p2 = await prisma.property.create({
    data: {
      title: '2 BHK Premium High-Rise Rohini',
      description: 'Beautiful 2 BHK flat near City Center park, well ventilated with modular kitchen.',
      ownerId: 'broker-202',
      ownerRole: 'BROKER',
      listingType: 'SALE',
      propertyType: 'APARTMENT',
      constructionStatus: 'READY_TO_MOVE',
      furnishingStatus: 'SEMI_FURNISHED',
      price: 6500000,
      areaSqFt: 1050,
      bedrooms: 2,
      bathrooms: 2,
      parkingSlots: 1,
      address: 'Pocket 5, Sector 13, Rohini',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110085',
      latitude: 28.716,
      longitude: 77.114,
      metroProximity: true,
      status: 'APPROVED',
      approvedBy: 'admin-01',
      approvedAt: new Date(),
      avgRating: 4.5,
      totalReviews: 8,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            key: 'img-2',
            isPrimary: true
          }
        ]
      }
    }
  });

  const p3 = await prisma.property.create({
    data: {
      title: '4 BHK Independent Sea View Villa Bandra',
      description: 'Exclusive independent villa with private swimming pool and direct ocean view.',
      ownerId: 'builder-101',
      ownerRole: 'BUILDER',
      listingType: 'RENT',
      propertyType: 'VILLA',
      constructionStatus: 'READY_TO_MOVE',
      furnishingStatus: 'FULLY_FURNISHED',
      price: 250000,
      securityDeposit: 1000000,
      leaseDurationMonths: 11,
      areaSqFt: 3200,
      bedrooms: 4,
      bathrooms: 4,
      parkingSlots: 3,
      address: 'Carter Road, Bandra West',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      latitude: 19.059,
      longitude: 72.825,
      metroProximity: false,
      status: 'APPROVED',
      approvedBy: 'admin-01',
      approvedAt: new Date(),
      avgRating: 4.9,
      totalReviews: 18,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            key: 'img-3',
            isPrimary: true
          }
        ]
      }
    }
  });

  console.log(`Successfully seeded ${p1.id}, ${p2.id}, ${p3.id} into database!`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
