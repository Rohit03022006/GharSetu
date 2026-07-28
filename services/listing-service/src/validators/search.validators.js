import { z } from 'zod';

export const searchSchema = z.object({
  city: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  bedrooms: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  constructionStatus: z.string().optional(),
  page: z.string().default('1'),
  limit: z.string().default('20')
});
