import { z } from 'zod';

export const logViewSchema = z.object({
  propertyId: z.string().uuid({ message: 'Valid propertyId UUID is required' })
});

export const logSearchSchema = z.object({
  filters: z.record(z.any(), { message: 'Search filters object is required' })
});
