import { prisma } from '../lib/prisma.js';
import * as validator from '../validators/listing.validators.js';
import * as propertyService from '../services/property.service.js';
import { checkDuplicateListing } from '../services/duplicateDetection.service.js';
import * as redisCache from '../lib/redis.js';
import { logger } from '../utils/logger.js';

export const checkDuplicateListings = async (req, res, next) => {
  try {
    const { address, price, areaSqFt, latitude, longitude } = req.body;
    const duplicates = await checkDuplicateListing(address, price, Number(areaSqFt), latitude, longitude);
    res.json({ success: true, duplicates });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Draft Property (FR-PROP-01)
 */
export const createDraft = async (req, res, next) => {
  try {
    const validated = validator.draftPropertySchema.parse(req.body);
    const { amenities, ...propertyData } = validated;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: req.user.id,
        ownerRole: req.user.role,
        status: 'DRAFT',
        ...(amenities && amenities.length > 0 ? {
          amenities: {
            create: amenities.map(name => ({
              amenity: {
                connectOrCreate: {
                  where: { name },
                  create: { name }
                }
              }
            }))
          }
        } : {})
      },
      include: { images: true, amenities: { include: { amenity: true } } }
    });

    res.status(201).json({ success: true, message: 'Draft property created successfully', data: property });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

/**
 * 30-Second Autosave Draft (FR-PROP-02)
 */
export const autosaveDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = validator.updatePropertySchema.parse(req.body);

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property draft not found' } });
    }

    if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized to edit this property' } });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...validated,
        status: 'DRAFT'
      }
    });

    res.json({ success: true, message: 'Draft autosaved successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Draft for Review with Duplicate Check (FR-PROP-03, FR-PROP-06)
 */
export const submitForReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    // Run duplicate check
    const duplicateCheck = await propertyService.checkDuplicateListing(
      property.address, property.price, property.areaSqFt, property.latitude, property.longitude
    );

    const updated = await prisma.property.update({
      where: { id },
      data: { status: 'PENDING' }
    });

    res.json({
      success: true,
      message: 'Property submitted for admin review',
      duplicateCheck,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Approve Property (FR-PROP-04)
 */
export const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user.id,
        approvedAt: new Date()
      }
    });

    // Invalidate Redis search cache
    await redisCache.invalidateSearchCache();

    res.json({ success: true, message: 'Property approved and live in search', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Property Details by ID for Public / Buyer / Client Views
 */
export const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        amenities: { include: { amenity: true } },
        reviews: {
          where: { isHidden: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Get Moderation Queue (Pending properties)
 */
export const getModerationQueue = async (req, res, next) => {
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'PENDING' },
      include: {
        images: true,
        amenities: { include: { amenity: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Reject Property with Reason (FR-PROP-05)
 */
export const rejectProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rejectionReason = req.body.rejectionReason || req.body.reason || 'Failed quality or RERA compliance checks';
    const rejectionNote = req.body.rejectionNote || req.body.note || '';

    const updated = await prisma.property.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason,
        rejectionNote,
        rejectionCount: { increment: 1 }
      }
    });

    res.json({ success: true, message: 'Property listing rejected', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Image Upload Pipeline (Multer -> Sharp Compression -> MinIO Storage) (FR-PROP-07)
 */
export const uploadPropertyImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: { code: 'NO_FILE', message: 'No image file provided' } });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    // Process & upload image to MinIO
    const { key, url } = await propertyService.processAndUploadImage(req.file.buffer, req.file.originalname);

    const existingImages = await prisma.propertyImage.count({ where: { propertyId: id } });

    const propertyImage = await prisma.propertyImage.create({
      data: {
        propertyId: id,
        url,
        key,
        isPrimary: existingImages === 0
      }
    });

    res.status(201).json({ success: true, message: 'Image uploaded to MinIO successfully', data: propertyImage });
  } catch (error) {
    next(error);
  }
};

/**
 * Search & Discovery Endpoint with Redis Caching (FR-SEARCH-01, FR-SEARCH-02, FR-SEARCH-03)
 */
export const searchProperties = async (req, res, next) => {
  try {
    const {
      city, minPrice, maxPrice, bedrooms, propertyType, listingType, constructionStatus, query, q, title, page = 1, limit = 20
    } = req.query;

    const searchTerm = query || q || title || '';

    const cacheKey = JSON.stringify(req.query);
    const cachedResults = await redisCache.getCachedSearchResult(cacheKey);

    if (cachedResults) {
      return res.json({ ...cachedResults, cached: true });
    }

    const where = {
      ...(searchTerm ? {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { city: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } }
        ]
      } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(bedrooms ? { bedrooms: parseInt(bedrooms) } : {}),
      ...(propertyType ? { propertyType } : {}),
      ...(listingType ? { listingType } : {}),
      ...(constructionStatus ? { constructionStatus } : {}),
      ...(minPrice || maxPrice ? {
        price: {
          ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
          ...(maxPrice ? { lte: parseFloat(maxPrice) } : {})
        }
      } : {})
    };

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take,
        include: { images: true, amenities: { include: { amenity: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.property.count({ where })
    ]);

    const responsePayload = {
      success: true,
      count: properties.length,
      totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / take),
      data: properties
    };

    // Cache in Redis for 5 minutes (300s)
    await redisCache.cacheSearchResult(cacheKey, responsePayload, 300);

    res.json({ ...responsePayload, cached: false });
  } catch (error) {
    next(error);
  }
};

/**
 * Internal Endpoint for Other Microservices (e.g. Finance, Engagement)
 */
export const getInternalPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Review & Rating (FR-REV-01, FR-REV-02, FR-REV-05)
 */
export const submitReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = validator.createReviewSchema.parse(req.body);

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    const review = await prisma.review.create({
      data: {
        propertyId: id,
        buyerId: req.user.id,
        buyerName: req.user.name || 'Buyer',
        bookingId: validated.bookingId,
        rating: validated.rating,
        comment: validated.comment
      }
    });

    // Recompute property average rating
    const aggregate = await prisma.review.aggregate({
      where: { propertyId: id, isHidden: false },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.property.update({
      where: { id },
      data: {
        avgRating: aggregate._avg.rating || 0.0,
        totalReviews: aggregate._count.rating || 0
      }
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: { code: 'DUPLICATE_REVIEW', message: 'You have already reviewed this booking' } });
    }
    next(error);
  }
};

/**
 * Update Property Lifecycle Status (FR-PROP-03)
 * PATCH /properties/:id/status
 */
export const updatePropertyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;
    const { status } = validator.updateStatusSchema.parse(req.body);

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    if (userRole !== 'ADMIN') {
      if (property.ownerId !== userId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not own this listing' } });
      }
      if (!['SOLD', 'RENTED', 'ARCHIVED', 'PENDING', 'DRAFT'].includes(status)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: `Only administrators can mark properties as ${status}`
          }
        });
      }
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { status }
    });

    // Invalidate Redis cache
    await redisClient.del(`property:${id}`);

    // Publish event for analytics/engagement
    publishEvent('property.status_changed', {
      propertyId: id,
      ownerId: property.ownerId,
      oldStatus: property.status,
      newStatus: status
    });

    res.json({
      success: true,
      message: `Property status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

