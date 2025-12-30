/**
 * AWS Secrets Manager Integration
 * Retrieves secrets from AWS Secrets Manager at runtime
 *
 * Setup:
 * 1. Create secret in AWS Secrets Manager (JSON format)
 * 2. Set SECRET_ARN or SECRET_NAME in .env.secrets-aws
 * 3. Grant secretsmanager:GetSecretValue permission to IAM role
 *
 * Usage:
 * import { getSecrets, getSecret } from '@/lib/awsSecrets';
 * const secrets = await getSecrets(); // Get all secrets
 * const dbUrl = await getSecret('DATABASE_URL'); // Get specific secret
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
  DescribeSecretCommand,
} from "@aws-sdk/client-secrets-manager";

// Initialize AWS Secrets Manager client
const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined, // Use IAM role in production
});

// Cache for secrets (reduces API calls)
let secretsCache: Record<string, any> = {};
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Retrieve all secrets from AWS Secrets Manager
 * Returns a parsed JSON object with all secret key-value pairs
 */
export async function getSecrets(): Promise<Record<string, string>> {
  // Return cached secrets if still valid
  if (
    Object.keys(secretsCache).length > 0 &&
    Date.now() - cacheTimestamp < CACHE_TTL
  ) {
    return secretsCache;
  }

  try {
    const secretId = process.env.SECRET_ARN || process.env.SECRET_NAME;

    if (!secretId) {
      throw new Error(
        "SECRET_ARN or SECRET_NAME not configured in environment"
      );
    }

    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await client.send(command);

    if (!response.SecretString) {
      throw new Error("Secret value is empty");
    }

    // Parse the JSON secret string
    const secrets = JSON.parse(response.SecretString);

    // Update cache
    secretsCache = secrets;
    cacheTimestamp = Date.now();

    return secrets;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Error retrieving secrets from AWS:", error.message);
    throw new Error(`Failed to retrieve secrets: ${error.message}`);
  }
}

/**
 * Retrieve a specific secret by key
 */
export async function getSecret(key: string): Promise<string | undefined> {
  const secrets = await getSecrets();
  return secrets[key];
}

/**
 * Get metadata about the secret (rotation status, last changed, etc.)
 */
export async function getSecretMetadata() {
  try {
    const secretId = process.env.SECRET_ARN || process.env.SECRET_NAME;

    if (!secretId) {
      throw new Error(
        "SECRET_ARN or SECRET_NAME not configured in environment"
      );
    }

    const command = new DescribeSecretCommand({ SecretId: secretId });
    const response = await client.send(command);

    return {
      name: response.Name,
      arn: response.ARN,
      description: response.Description,
      rotationEnabled: response.RotationEnabled || false,
      lastRotatedDate: response.LastRotatedDate,
      lastChangedDate: response.LastChangedDate,
      lastAccessedDate: response.LastAccessedDate,
      tags: response.Tags,
    };
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Error retrieving secret metadata:", error.message);
    throw new Error(`Failed to retrieve secret metadata: ${error.message}`);
  }
}

/**
 * Clear the secrets cache (useful for testing or forcing refresh)
 */
export function clearSecretsCache() {
  secretsCache = {};
  cacheTimestamp = 0;
}

/**
 * Validate AWS Secrets Manager configuration
 */
export async function validateConfig(): Promise<{
  configured: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!process.env.AWS_REGION) {
    errors.push("AWS_REGION not set");
  }

  if (!process.env.SECRET_ARN && !process.env.SECRET_NAME) {
    errors.push("SECRET_ARN or SECRET_NAME not set");
  }

  // Try to connect
  if (errors.length === 0) {
    try {
      await getSecrets();
    } catch (error: any) {
      errors.push(`Connection failed: ${error.message}`);
    }
  }

  return {
    configured: errors.length === 0,
    errors,
  };
}
