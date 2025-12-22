import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { handleError } from "@/app/lib/errorHandler";
import { logger } from "@/app/lib/logger";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Validation schema
const uploadRequestSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = uploadRequestSchema.parse(body);
    const { filename, fileType, fileSize } = validatedData;

    // Validate file type (images and PDFs only)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(fileType)) {
      logger.warn("Unsupported file type attempted", { fileType, filename });
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported file type. Only images (JPEG, PNG, GIF) and PDFs are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      logger.warn("File size exceeds limit", { fileSize, filename });
      return NextResponse.json(
        {
          success: false,
          message: "File size exceeds 10MB limit.",
        },
        { status: 400 }
      );
    }

    // Generate unique filename to prevent collisions
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;

    // Create S3 PutObject command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFilename,
      ContentType: fileType,
    });

    // Generate pre-signed URL with 60 seconds expiry
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });

    logger.info("Pre-signed URL generated successfully", {
      filename: uniqueFilename,
      fileType,
      expiresIn: 60,
    });

    return NextResponse.json({
      success: true,
      uploadURL,
      filename: uniqueFilename,
      message: "Pre-signed URL generated. Upload within 60 seconds.",
    });
  } catch (error) {
    return handleError(error, "POST /api/upload");
  }
}
