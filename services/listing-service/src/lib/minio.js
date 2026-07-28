import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../utils/logger.js';

const minioEndpoint = process.env.MINIO_ENDPOINT;
const minioPort = process.env.MINIO_PORT || 9000;
const useSSL = process.env.MINIO_USE_SSL === 'true';

const endpointUrl = `${useSSL ? 'https' : 'http'}://${minioEndpoint}:${minioPort}`;

export const s3Client = new S3Client({
  endpoint: endpointUrl,
  region: 'us-east-1', // MinIO requires a region string
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY
  },
  forcePathStyle: true // Mandatory for MinIO local buckets
});

export const bucketName = process.env.MINIO_BUCKET || 'gharsetu-listings';

/**
 * Upload compressed buffer to MinIO bucket
 */
export const uploadToMinIO = async (fileBuffer, fileName, mimeType) => {
  try {
    const key = `properties/${Date.now()}_${fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType
    });

    await s3Client.send(command);

    const publicUrl = `${endpointUrl}/${bucketName}/${key}`;
    return { key, url: publicUrl };
  } catch (error) {
    logger.error('Failed to upload file to MinIO:', error);
    throw new Error('MinIO storage upload failed');
  }
};

/**
 * Delete object from MinIO bucket
 */
export const deleteFromMinIO = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    await s3Client.send(command);
  } catch (error) {
    logger.error(`Failed to delete key ${key} from MinIO:`, error);
  }
};
