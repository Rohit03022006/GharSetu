import { z } from 'zod';

export const addWishlistSchema = z.object({
  propertyId: z.string().uuid({ message: 'Valid propertyId UUID is required' }),
  notes: z.string().optional()
});

export const comparePropertiesSchema = z.object({
  propertyIds: z.array(z.string().uuid({ message: 'Property IDs must be valid UUIDs' }))
    .min(2, { message: 'At least 2 properties are required for comparison' })
    .max(4, { message: 'Maximum 4 properties can be compared at a time' })
});
