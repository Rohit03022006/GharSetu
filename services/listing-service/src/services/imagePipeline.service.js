import sharp from 'sharp';
import { uploadToMinIO } from '../lib/minio.js';

export const processAndUploadImage = async (fileBuffer, originalName) => {
  const compressedBuffer = await sharp(fileBuffer)
    .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const fileName = `${originalName.replace(/\.[^/.]+$/, '')}.webp`;
  const result = await uploadToMinIO(compressedBuffer, fileName, 'image/webp');
  return result;
};
