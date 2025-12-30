/**
 * AWS S3 Storage Configuration
 * Handles S3 client initialization and operations
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const s3Config = {
  bucketName: process.env.AWS_BUCKET_NAME!,
  region: process.env.AWS_REGION || process.env.AWS_BUCKET_REGION,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
  allowedTypes: (
    process.env.ALLOWED_FILE_TYPES ||
    "image/jpeg,image/png,image/jpg,application/pdf"
  ).split(","),
  presignedUrlExpiration: parseInt(
    process.env.PRESIGNED_URL_EXPIRATION || "300"
  ), // 5 minutes
};

/**
 * Generate presigned URL for uploading to S3
 */
export async function generateUploadUrl(
  fileName: string,
  fileType: string,
  expiresIn = s3Config.presignedUrlExpiration
) {
  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    ContentType: fileType,
    ACL: (process.env.S3_ACL as any) || "private",
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    uploadUrl,
    key,
    fileName,
  };
}

/**
 * Generate presigned URL for downloading from S3
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn = s3Config.presignedUrlExpiration
) {
  const command = new GetObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return downloadUrl;
}

/**
 * Delete object from S3
 */
export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
  });

  await s3Client.send(command);
  return { success: true, key };
}

/**
 * Validate file before upload
 */
export function validateFile(file: {
  name: string;
  type: string;
  size: number;
}) {
  const errors: string[] = [];

  // Check file type
  if (!s3Config.allowedTypes.includes(file.type)) {
    errors.push(
      `File type ${file.type} not allowed. Allowed types: ${s3Config.allowedTypes.join(", ")}`
    );
  }

  // Check file size
  if (file.size > s3Config.maxFileSize) {
    errors.push(
      `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(s3Config.maxFileSize / 1024 / 1024).toFixed(2)}MB`
    );
  }

  // Check file name
  if (!file.name || file.name.length > 255) {
    errors.push("Invalid file name");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export { s3Client };
