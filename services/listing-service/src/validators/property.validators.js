import { z } from 'zod';

const rawPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  listingType: z.enum(['SALE', 'RENT']).default('SALE'),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'PLOT']).default('APARTMENT'),
  constructionStatus: z.enum(['UNDER_CONSTRUCTION', 'READY_TO_MOVE']).default('READY_TO_MOVE'),
  furnishingStatus: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED']).optional(),
  
  price: z.number().positive('Price must be greater than 0'),
  securityDeposit: z.number().nonnegative().optional(),
  leaseDurationMonths: z.number().int().positive().optional(),
  
  areaSqFt: z.number().positive('Area must be greater than 0'),
  bedrooms: z.number().int().min(0).default(1),
  bathrooms: z.number().int().min(0).default(1),
  parkingSlots: z.number().int().min(0).default(0),
  
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  metroProximity: z.boolean().default(false),
  
  amenities: z.array(z.string()).optional()
});

export const createPropertySchema = rawPropertySchema.refine((data) => {
  if (data.listingType === 'RENT') {
    return data.securityDeposit !== undefined && data.leaseDurationMonths !== undefined;
  }
  return true;
}, {
  message: "Rental listings require securityDeposit and leaseDurationMonths",
  path: ["securityDeposit"]
});

export const updatePropertySchema = rawPropertySchema.partial();

export const rejectPropertySchema = z.object({
  rejectionReason: z.enum(['SPAM', 'DUPLICATE', 'FAKE', 'INCOMPLETE', 'POLICY_VIOLATION', 'OTHER']),
  rejectionNote: z.string().optional()
});
