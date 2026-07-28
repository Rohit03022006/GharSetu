import sharp from 'sharp';
import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { uploadToMinIO } from '../lib/minio.js';
import { logger } from '../utils/logger.js';

export const checkDuplicateListing = async (address, price, areaSqFt, latitude, longitude) => {
  const minPrice = price * 0.95;
  const maxPrice = price * 1.05;

  const duplicates = await prisma.property.findMany({
    where: {
      status: { in: ['PENDING', 'APPROVED'] },
      price: { gte: minPrice, lte: maxPrice },
      areaSqFt: { gte: areaSqFt * 0.9, lte: areaSqFt * 1.1 },
      OR: [
        { address: { contains: address, mode: 'insensitive' } },
        ...(latitude && longitude ? [{
          latitude: { gte: latitude - 0.001, lte: latitude + 0.001 },
          longitude: { gte: longitude - 0.001, lte: longitude + 0.001 }
        }] : [])
      ]
    },
    select: { id: true, title: true, address: true, price: true }
  });

  return {
    isPossibleDuplicate: duplicates.length > 0,
    matchedProperties: duplicates
  };
};

export const processAndUploadImage = async (fileBuffer, originalName) => {
  const compressedBuffer = await sharp(fileBuffer)
    .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const fileName = `${originalName.replace(/\.[^/.]+$/, '')}.webp`;
  const result = await uploadToMinIO(compressedBuffer, fileName, 'image/webp');
  return result;
};

import { safeHttpRequest } from '../lib/circuitBreaker.js';

export const checkOwnerVerificationStatus = async (ownerId) => {
  const identityUrl = process.env.IDENTITY_SERVICE_URL;
  const result = await safeHttpRequest({
    method: 'GET',
    url: `${identityUrl}/auth/internal/user-status/${ownerId}`
  }, 3000, null);

  return result?.verificationStatus === 'VERIFIED';
};

