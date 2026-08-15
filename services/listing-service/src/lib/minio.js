import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
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

let bucketEnsured = false;
export const ensureBucketExists = async () => {
  if (bucketEnsured) return;
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    bucketEnsured = true;
  } catch (err) {
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      bucketEnsured = true;
      logger.info(`Created MinIO bucket: ${bucketName}`);
    } catch (createErr) {
      logger.warn(`Could not create bucket ${bucketName} (might already exist): ${createErr.message}`);
    }
  }
};

/**
 * Upload compressed buffer to MinIO bucket
 */
export const uploadToMinIO = async (fileBuffer, fileName, mimeType) => {
  try {
    await ensureBucketExists();
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
