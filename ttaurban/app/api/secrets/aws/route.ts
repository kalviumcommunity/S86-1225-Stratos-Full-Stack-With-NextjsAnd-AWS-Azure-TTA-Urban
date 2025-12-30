/**
 * AWS Secrets Manager - Get Secrets Endpoint
 * GET /api/secrets/aws
 *
 * Demonstrates secure secret retrieval from AWS Secrets Manager
 * Returns list of available secret keys (not values for security)
 */

import { NextResponse } from "next/server";
import { getSecrets, getSecretMetadata } from "@/lib/awsSecrets";

export async function GET() {
  try {
    // Retrieve all secrets
    const secrets = await getSecrets();
    const metadata = await getSecretMetadata();

    // Return only secret keys, not values (security best practice)
    const secretKeys = Object.keys(secrets);

    return NextResponse.json({
      success: true,
      provider: "AWS Secrets Manager",
      secretCount: secretKeys.length,
      availableSecrets: secretKeys,
      metadata: {
        name: metadata.name,
        arn: metadata.arn,
        rotationEnabled: metadata.rotationEnabled,
        lastRotatedDate: metadata.lastRotatedDate,
        lastChangedDate: metadata.lastChangedDate,
      },
      message: "Secrets retrieved successfully from AWS Secrets Manager",
    });
  } catch (error: any) {
    console.error("Error retrieving AWS secrets:", error.message);
    return NextResponse.json(
      {
        success: false,
        provider: "AWS Secrets Manager",
        error: error.message,
        hint: "Check AWS_REGION, SECRET_ARN/SECRET_NAME, and IAM permissions",
      },
      { status: 500 }
    );
  }
}
