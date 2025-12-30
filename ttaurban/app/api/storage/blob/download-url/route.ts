/**
 * API Route: Generate SAS Download URL (Azure Blob)
 * POST /api/storage/blob/download-url
 */

import { NextRequest, NextResponse } from "next/server";
import { generateDownloadUrl } from "@/app/lib/azureBlob";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blobName } = body;

    if (!blobName) {
      return NextResponse.json(
        { error: "Missing required field: blobName" },
        { status: 400 }
      );
    }

    // Generate SAS download URL
    const downloadUrl = await generateDownloadUrl(blobName);

    return NextResponse.json({
      downloadUrl,
      blobName,
      expiresIn: 300, // 5 minutes
    });
  } catch (error: any) {
    console.error("Error generating Azure Blob download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL", details: error.message },
      { status: 500 }
    );
  }
}
