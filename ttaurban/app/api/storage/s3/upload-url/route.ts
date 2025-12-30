/**
 * API Route: Generate Presigned Upload URL (AWS S3)
 * POST /api/storage/s3/upload-url
 */

import { NextRequest, NextResponse } from "next/server";
import { generateUploadUrl, validateFile } from "@/app/lib/s3";

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

    // Generate presigned URL
    const {
      uploadUrl,
      key,
      fileName: savedFileName,
    } = await generateUploadUrl(fileName, fileType);

    return NextResponse.json({
      uploadUrl,
      key,
      fileName: savedFileName,
      expiresIn: 300, // 5 minutes
    });
  } catch (error: any) {
    console.error("Error generating S3 upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL", details: error.message },
      { status: 500 }
    );
  }
}
