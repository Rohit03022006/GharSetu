import { prisma } from '../lib/prisma.js';
import * as validator from '../validators/property.validators.js';
import * as propertyService from '../services/property.service.js';
import * as redisCache from '../lib/redis.js';

export const createDraft = async (req, res, next) => {
  try {
    const validated = validator.createPropertySchema.parse(req.body);
    const { amenities, ...propertyData } = validated;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: req.user.userId || req.user.id,
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

export const autosaveDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = validator.updatePropertySchema.parse(req.body);

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property draft not found' } });
    }

    const currentUserId = req.user.userId || req.user.id;
    if (existing.ownerId !== currentUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized to edit this property' } });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { ...validated, status: 'DRAFT' }
    });

    res.json({ success: true, message: 'Draft autosaved successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const submitForReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }

    const currentUserId = req.user.userId || req.user.id;
    if (property.ownerId !== currentUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

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
        approvedBy: req.user.userId || req.user.id,
        approvedAt: new Date()
      }
    });

    await redisCache.invalidateSearchCache();
    res.json({ success: true, message: 'Property approved and live in search', data: updated });
  } catch (error) {
    next(error);
  }
};

export const rejectProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = validator.rejectPropertySchema.parse(req.body);

    const updated = await prisma.property.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: validated.rejectionReason,
        rejectionNote: validated.rejectionNote,
        rejectionCount: { increment: 1 }
      }
    });

    res.json({ success: true, message: 'Property listing rejected', data: updated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    }
    next(error);
  }
};

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

    const currentUserId = req.user.userId || req.user.id;
    if (property.ownerId !== currentUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

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
