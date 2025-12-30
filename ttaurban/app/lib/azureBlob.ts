/**
 * Azure Blob Storage Configuration
 * Handles Blob client initialization and operations
 */

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

// Initialize Blob Service Client
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

export const blobConfig = {
  containerName: process.env.AZURE_CONTAINER_NAME || "uploads",
  accountName,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
  allowedTypes: (
    process.env.ALLOWED_FILE_TYPES ||
    "image/jpeg,image/png,image/jpg,application/pdf"
  ).split(","),
  sasTokenExpiration: parseInt(process.env.SAS_TOKEN_EXPIRATION || "5"), // 5 minutes
};

/**
 * Generate SAS URL for uploading to Azure Blob
 */
export async function generateUploadUrl(fileName: string, fileType: string) {
  const containerClient = blobServiceClient.getContainerClient(
    blobConfig.containerName
  );
  const blobName = `uploads/${Date.now()}-${fileName}`;
  const blobClient = containerClient.getBlobClient(blobName);
  const blockBlobClient = blobClient.getBlockBlobClient();

  // Generate SAS token
  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + blobConfig.sasTokenExpiration);

  const permissions = new BlobSASPermissions();
  permissions.write = true;
  permissions.create = true;

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: blobConfig.containerName,
      blobName,
      permissions,
      expiresOn,
    },
    sharedKeyCredential
  ).toString();

  const uploadUrl = `${blockBlobClient.url}?${sasToken}`;

  return {
    uploadUrl,
    blobName,
    fileName,
    contentType: fileType,
  };
}

/**
 * Generate SAS URL for downloading from Azure Blob
 */
export async function generateDownloadUrl(blobName: string) {
  const containerClient = blobServiceClient.getContainerClient(
    blobConfig.containerName
  );
  const blobClient = containerClient.getBlobClient(blobName);

  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + blobConfig.sasTokenExpiration);

  const permissions = new BlobSASPermissions();
  permissions.read = true;

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: blobConfig.containerName,
      blobName,
      permissions,
      expiresOn,
    },
    sharedKeyCredential
  ).toString();

  return `${blobClient.url}?${sasToken}`;
}

/**
 * Delete blob from Azure Storage
 */
export async function deleteFile(blobName: string) {
  const containerClient = blobServiceClient.getContainerClient(
    blobConfig.containerName
  );
  const blobClient = containerClient.getBlobClient(blobName);

  await blobClient.delete();
  return { success: true, blobName };
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
  if (!blobConfig.allowedTypes.includes(file.type)) {
    errors.push(
      `File type ${file.type} not allowed. Allowed types: ${blobConfig.allowedTypes.join(", ")}`
    );
  }

  // Check file size
  if (file.size > blobConfig.maxFileSize) {
    errors.push(
      `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(blobConfig.maxFileSize / 1024 / 1024).toFixed(2)}MB`
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

export { blobServiceClient };
