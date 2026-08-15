import { z } from 'zod';

export const rawPropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  listingType: z.enum(['SALE', 'RENT']).default('SALE'),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'PLOT']).default('APARTMENT'),
  constructionStatus: z.enum(['UNDER_CONSTRUCTION', 'READY_TO_MOVE']).default('READY_TO_MOVE'),
  furnishingStatus: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED']).optional(),
  
  price: z.coerce.number().positive('Price must be greater than 0'),
  securityDeposit: z.coerce.number().nonnegative().optional(),
  leaseDurationMonths: z.coerce.number().int().positive().optional(),
  
  areaSqFt: z.coerce.number().positive('Area must be greater than 0'),
  bedrooms: z.coerce.number().int().min(0).default(1),
  bathrooms: z.coerce.number().int().min(0).default(1),
  parkingSlots: z.coerce.number().int().min(0).default(0),
  
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
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

export const draftPropertySchema = z.object({
  title: z.string().min(1, 'Title is required').default('Untitled Property Draft'),
  description: z.string().optional().default(''),
  listingType: z.enum(['SALE', 'RENT']).default('SALE'),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'PLOT']).default('APARTMENT'),
  constructionStatus: z.enum(['UNDER_CONSTRUCTION', 'READY_TO_MOVE']).default('READY_TO_MOVE'),
  furnishingStatus: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED']).optional(),
  
  price: z.coerce.number().nonnegative().default(0),
  securityDeposit: z.coerce.number().nonnegative().optional(),
  leaseDurationMonths: z.coerce.number().int().positive().optional(),
  
  areaSqFt: z.coerce.number().nonnegative().default(500),
  bedrooms: z.coerce.number().int().min(0).default(1),
  bathrooms: z.coerce.number().int().min(0).default(1),
  parkingSlots: z.coerce.number().int().min(0).default(0),
  
  address: z.string().default('Pending Address'),
  city: z.string().default('Mumbai'),
  state: z.string().default('Maharashtra'),
  pincode: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  metroProximity: z.boolean().default(false),
  
  amenities: z.array(z.string()).optional()
});

export const updatePropertySchema = draftPropertySchema.partial();

export const rejectPropertySchema = z.object({
  rejectionReason: z.enum(['SPAM', 'DUPLICATE', 'FAKE', 'INCOMPLETE', 'POLICY_VIOLATION', 'OTHER']),
  rejectionNote: z.string().optional()
});
