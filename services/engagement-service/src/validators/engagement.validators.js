import { z } from 'zod';

export const createAvailabilitySchema = z.object({
  propertyId: z.string().uuid({ message: 'Valid propertyId UUID is required' }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' }),
  timeSlot: z.string().min(3, { message: 'Time slot string is required (e.g. 10:00-11:00)' })
});

export const createBookingSchema = z.object({
  propertyId: z.string().uuid({ message: 'Valid propertyId UUID is required' }),
  availabilityId: z.string().uuid({ message: 'Valid availabilityId UUID is required' }),
  notes: z.string().optional()
});

export const cancelBookingSchema = z.object({
  reason: z.string().optional()
});

export const rescheduleBookingSchema = z.object({
  newAvailabilityId: z.string().uuid({ message: 'Valid newAvailabilityId UUID is required' }),
  notes: z.string().optional()
});

export const updateLeadStageSchema = z.object({
  toStage: z.enum(['NEW', 'CONTACTED', 'VISIT_SCHEDULED', 'VISIT_COMPLETED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST'], {
    message: 'Valid LeadStage enum value required'
  }),
  notes: z.string().optional()
});
