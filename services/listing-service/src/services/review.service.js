import { prisma } from '../lib/prisma.js';

export const createReviewService = async (propertyId, buyer, { bookingId, rating, comment }) => {
  const review = await prisma.review.create({
    data: {
      propertyId,
      buyerId: buyer.id,
      buyerName: buyer.name || 'Buyer',
      bookingId,
      rating,
      comment
    }
  });

  // Recompute property average rating
  const aggregate = await prisma.review.aggregate({
    where: { propertyId, isHidden: false },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      avgRating: aggregate._avg.rating || 0.0,
      totalReviews: aggregate._count.rating || 0
    }
  });

  return review;
};

export const replyToReviewService = async (reviewId, ownerId, replyText) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { property: true }
  });

  if (!review) {
    throw new Error('NOT_FOUND: Review not found');
  }

  if (review.property.ownerId !== ownerId) {
    throw new Error('FORBIDDEN: Only property owner can reply to reviews');
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data: {
      replyText,
      repliedAt: new Date()
    }
  });
};

export const moderateReviewService = async (reviewId, isHidden) => {
  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { isHidden }
  });

  // Recompute property rating excluding hidden review
  const aggregate = await prisma.review.aggregate({
    where: { propertyId: updated.propertyId, isHidden: false },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await prisma.property.update({
    where: { id: updated.propertyId },
    data: {
      avgRating: aggregate._avg.rating || 0.0,
      totalReviews: aggregate._count.rating || 0
    }
  });

  return updated;
};
