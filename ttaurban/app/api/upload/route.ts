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

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Generate pre-signed upload URL
 *     description: Generates a pre-signed S3 URL for direct file upload. Supports images and PDFs up to 10MB.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - fileType
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Original filename
 *                 example: complaint-photo.jpg
 *               fileType:
 *                 type: string
 *                 enum: [image/jpeg, image/png, image/jpg, image/gif, application/pdf]
 *                 description: MIME type of the file
 *                 example: image/jpeg
 *               fileSize:
 *                 type: number
 *                 description: File size in bytes (max 10MB)
 *                 example: 2048000
 *     responses:
 *       200:
 *         description: Pre-signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 uploadURL:
 *                   type: string
 *                   format: uri
 *                   description: Pre-signed S3 URL (valid for 60 seconds)
 *                 fileKey:
 *                   type: string
 *                   description: Unique S3 object key
 *                   example: 1704633600000-complaint-photo.jpg
 *                 publicURL:
 *                   type: string
 *                   format: uri
 *                   description: Public URL to access uploaded file
 *       400:
 *         description: Invalid file type or size exceeds limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               unsupportedType:
 *                 value:
 *                   success: false
 *                   message: Unsupported file type. Only images (JPEG, PNG, GIF) and PDFs are allowed.
 *               sizeExceeded:
 *                 value:
 *                   success: false
 *                   message: File size exceeds 10MB limit.
 */
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
