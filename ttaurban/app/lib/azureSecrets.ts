/**
 * Azure Key Vault Integration
 * Retrieves secrets from Azure Key Vault at runtime
 *
 * Setup:
 * 1. Create Key Vault in Azure Portal
 * 2. Add secrets via Portal or CLI (az keyvault secret set)
 * 3. Set KEYVAULT_NAME in .env.secrets-azure
 * 4. Grant 'Get' permission using Access Policies or RBAC
 *
 * Usage:
 * import { getSecrets, getSecret } from '@/lib/azureSecrets';
 * const secrets = await getSecrets(['DATABASE-URL', 'JWT-SECRET']);
 * const dbUrl = await getSecret('DATABASE-URL');
 */

import { SecretClient } from "@azure/keyvault-secrets";
import {
  DefaultAzureCredential,
  ClientSecretCredential,
} from "@azure/identity";

// Secret name mapping (Azure uses hyphens, we use underscores)
const SECRET_NAME_MAP: Record<string, string> = {
  "DATABASE-URL": "DATABASE_URL",
  "JWT-SECRET": "JWT_SECRET",
  "SENDGRID-API-KEY": "SENDGRID_API_KEY",
  "REDIS-URL": "REDIS_URL",
  "AWS-ACCESS-KEY-ID": "AWS_ACCESS_KEY_ID",
  "AWS-SECRET-ACCESS-KEY": "AWS_SECRET_ACCESS_KEY",
};

// Initialize Azure Key Vault client
function getClient(): SecretClient {
  const vaultName = process.env.KEYVAULT_NAME;

  if (!vaultName) {
    throw new Error("KEYVAULT_NAME not configured in environment");
  }

  const vaultUrl = `https://${vaultName}.vault.azure.net`;

  // Use Managed Identity in production, credentials for local dev
  const credential =
    process.env.USE_MANAGED_IDENTITY === "true" || !process.env.AZURE_CLIENT_ID
      ? new DefaultAzureCredential()
      : new ClientSecretCredential(
          process.env.AZURE_TENANT_ID!,
          process.env.AZURE_CLIENT_ID!,
          process.env.AZURE_CLIENT_SECRET!
        );

  return new SecretClient(vaultUrl, credential);
}

// Cache for secrets (reduces API calls)
let secretsCache: Record<string, string> = {};
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Retrieve a specific secret from Azure Key Vault
 * @param name - Secret name in Azure (e.g., 'DATABASE-URL')
 * @returns Secret value as string
 */
export async function getSecret(name: string): Promise<string> {
  // Check cache first
  const cacheKey = SECRET_NAME_MAP[name] || name;
  if (secretsCache[cacheKey] && Date.now() - cacheTimestamp < CACHE_TTL) {
    return secretsCache[cacheKey];
  }

  try {
    const client = getClient();
    const secret = await client.getSecret(name);

    if (!secret.value) {
      throw new Error(`Secret '${name}' has no value`);
    }

    // Update cache
    secretsCache[cacheKey] = secret.value;
    cacheTimestamp = Date.now();

    return secret.value;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(`Error retrieving secret '${name}':`, error.message);
    throw new Error(`Failed to retrieve secret '${name}': ${error.message}`);
  }
}

/**
 * Retrieve multiple secrets from Azure Key Vault
 * @param names - Array of secret names (e.g., ['DATABASE-URL', 'JWT-SECRET'])
 * @returns Object with environment variable names as keys
 */
export async function getSecrets(
  names: string[]
): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};

  // Fetch all secrets in parallel
  const promises = names.map(async (name) => {
    try {
      const value = await getSecret(name);
      const envKey = SECRET_NAME_MAP[name] || name.replace(/-/g, "_");
      secrets[envKey] = value;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(`Failed to fetch secret '${name}':`, error.message);
      // Continue fetching other secrets
    }
  });

  await Promise.all(promises);

  return secrets;
}

/**
 * List all available secret names in Key Vault
 */
export async function listSecretNames(): Promise<string[]> {
  try {
    const client = getClient();
    const secretNames: string[] = [];

    for await (const secretProperties of client.listPropertiesOfSecrets()) {
      if (secretProperties.name) {
        secretNames.push(secretProperties.name);
      }
    }

    return secretNames;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Error listing secrets:", error.message);
    throw new Error(`Failed to list secrets: ${error.message}`);
  }
}

/**
 * Get metadata about a specific secret
 */
export async function getSecretMetadata(name: string) {
  try {
    const client = getClient();
    const secret = await client.getSecret(name);

    return {
      name: secret.name,
      id: secret.properties.id,
      enabled: secret.properties.enabled,
      createdOn: secret.properties.createdOn,
      updatedOn: secret.properties.updatedOn,
      expiresOn: secret.properties.expiresOn,
      tags: secret.properties.tags,
      managed: secret.properties.managed,
    };
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(`Error retrieving metadata for '${name}':`, error.message);
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
 * Validate Azure Key Vault configuration
 */
export async function validateConfig(): Promise<{
  configured: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!process.env.KEYVAULT_NAME) {
    errors.push("KEYVAULT_NAME not set");
  }

  if (
    process.env.USE_MANAGED_IDENTITY !== "true" &&
    (!process.env.AZURE_TENANT_ID ||
      !process.env.AZURE_CLIENT_ID ||
      !process.env.AZURE_CLIENT_SECRET)
  ) {
    errors.push(
      "AZURE_TENANT_ID, AZURE_CLIENT_ID, or AZURE_CLIENT_SECRET not set"
    );
  }

  // Try to connect
  if (errors.length === 0) {
    try {
      await listSecretNames();
    } catch (error: any) {
      errors.push(`Connection failed: ${error.message}`);
    }
  }

  return {
    configured: errors.length === 0,
    errors,
  };
}
