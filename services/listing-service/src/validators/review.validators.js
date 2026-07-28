import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'bookingId is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters')
});

export const reviewReplySchema = z.object({
  replyText: z.string().min(2, 'Reply text is required')
});
