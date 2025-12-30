/**
 * API Route: Generate SAS Upload URL (Azure Blob)
 * POST /api/storage/blob/upload-url
 */

import { NextRequest, NextResponse } from "next/server";
import { generateUploadUrl, validateFile } from "@/app/lib/azureBlob";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "Missing required fields: fileName, fileType, fileSize" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile({
      name: fileName,
      type: fileType,
      size: fileSize,
    });
    if (!validation.valid) {
      return NextResponse.json(
        { error: "File validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Generate SAS URL
    const {
      uploadUrl,
      blobName,
      fileName: savedFileName,
      contentType,
    } = await generateUploadUrl(fileName, fileType);

    return NextResponse.json({
      uploadUrl,
      blobName,
      fileName: savedFileName,
      contentType,
      expiresIn: 300, // 5 minutes
    });
  } catch (error: any) {
    console.error("Error generating Azure Blob upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL", details: error.message },
      { status: 500 }
    );
  }
}
