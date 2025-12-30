/**
 * Azure Key Vault - Get Secrets Endpoint
 * GET /api/secrets/azure
 *
 * Demonstrates secure secret retrieval from Azure Key Vault
 * Returns list of available secret names (not values for security)
 */

import { NextResponse } from "next/server";
import { listSecretNames } from "@/lib/azureSecrets";

export async function GET() {
  try {
    // List all available secrets
    const secretNames = await listSecretNames();

    return NextResponse.json({
      success: true,
      provider: "Azure Key Vault",
      vaultName: process.env.KEYVAULT_NAME,
      secretCount: secretNames.length,
      availableSecrets: secretNames,
      message: "Secrets retrieved successfully from Azure Key Vault",
      note: "Secret names use hyphens (e.g., DATABASE-URL) but map to environment variables with underscores (DATABASE_URL)",
    });
  } catch (error: any) {
    console.error("Error retrieving Azure secrets:", error.message);
    return NextResponse.json(
      {
        success: false,
        provider: "Azure Key Vault",
        error: error.message,
        hint: "Check KEYVAULT_NAME, Azure credentials, and access policies",
      },
      { status: 500 }
    );
  }
}
