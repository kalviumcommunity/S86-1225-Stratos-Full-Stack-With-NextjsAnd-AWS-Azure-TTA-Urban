/**
 * Secret Validation Endpoint
 * GET /api/secrets/validate?provider=aws|azure
 *
 * Validates secret manager configuration without exposing secrets
 */

import { NextResponse } from "next/server";
// @ts-ignore - Path alias configured in tsconfig.json
import { validateConfig as validateAWS } from "@/lib/awsSecrets";
// @ts-ignore - Path alias configured in tsconfig.json
import { validateConfig as validateAzure } from "@/lib/azureSecrets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "aws";

  try {
    if (provider === "aws") {
      const result = await validateAWS();

      return NextResponse.json({
        provider: "AWS Secrets Manager",
        configured: result.configured,
        errors: result.errors,
        config: {
          region: process.env.AWS_REGION || "not set",
          secretArn: process.env.SECRET_ARN ? "configured" : "not set",
          secretName: process.env.SECRET_NAME ? "configured" : "not set",
          hasCredentials:
            !!process.env.AWS_ACCESS_KEY_ID &&
            !!process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    } else if (provider === "azure") {
      const result = await validateAzure();

      return NextResponse.json({
        provider: "Azure Key Vault",
        configured: result.configured,
        errors: result.errors,
        config: {
          vaultName: process.env.KEYVAULT_NAME || "not set",
          vaultUrl: process.env.KEYVAULT_URL || "not set",
          useManagedIdentity: process.env.USE_MANAGED_IDENTITY === "true",
          hasCredentials:
            !!process.env.AZURE_TENANT_ID &&
            !!process.env.AZURE_CLIENT_ID &&
            !!process.env.AZURE_CLIENT_SECRET,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid provider. Use 'aws' or 'azure'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        provider,
        configured: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
