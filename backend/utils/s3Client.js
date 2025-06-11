// utils/s3Client.js

import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

// Create reusable S3 client using credentials and region from .env
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Explicitly export the bucket name for use in controllers
export const bucketName = process.env.AWS_BUCKET_NAME;

/**
 * Uploads a file to AWS S3.
 * @param {string} filePath - Path to the file on disk
 * @param {string} fileName - Key name to save in S3
 */
export const uploadFileToS3 = async (filePath, fileName) => {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`✅ File uploaded to S3: ${fileName}`);
  } catch (err) {
    console.error('❌ Error uploading file to S3:', err);
    throw err;
  }
};

/**
 * Lists all files in the S3 bucket.
 * @returns {Promise<string[]>} List of file keys in the bucket
 */
export const listFilesInS3 = async () => {
  try {
    const data = await s3Client.send(
      new ListObjectsV2Command({ Bucket: bucketName })
    );
    return data.Contents?.map(obj => obj.Key) || [];
  } catch (err) {
    console.error('❌ Error listing files from S3:', err);
    throw err;
  }
};

/**
 * Deletes a specific file from the S3 bucket.
 * @param {string} fileName - S3 object key to delete
 */
export const deleteFileFromS3 = async (fileName) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      })
    );
    console.log(`🗑️ Deleted from S3: ${fileName}`);
  } catch (err) {
    console.error('❌ Error deleting file from S3:', err);
    throw err;
  }
};
