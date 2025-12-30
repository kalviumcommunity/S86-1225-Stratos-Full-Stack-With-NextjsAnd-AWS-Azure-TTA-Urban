/**
 * API Route: Generate Presigned Download URL (AWS S3)
 * POST /api/storage/s3/download-url
 */

import { NextRequest, NextResponse } from "next/server";
import { generateDownloadUrl } from "@/app/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Missing required field: key" },
        { status: 400 }
      );
    }

    // Generate presigned download URL
    const downloadUrl = await generateDownloadUrl(key);

    return NextResponse.json({
      downloadUrl,
      key,
      expiresIn: 300, // 5 minutes
    });
  } catch (error: any) {
    console.error("Error generating S3 download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL", details: error.message },
      { status: 500 }
    );
  }
}
