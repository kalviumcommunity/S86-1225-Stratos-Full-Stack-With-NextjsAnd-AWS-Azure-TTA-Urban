import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";
import { handleError } from "@/app/lib/errorHandler";
import { logger } from "@/app/lib/logger";
import { cacheHelpers } from "@/app/lib/redis";

// Validation schema for file metadata
const fileMetadataSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileURL: z.string().url("Invalid file URL"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().optional(),
  uploadedBy: z.number().optional(),
});

// GET /api/files - List all files with pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Try to get from cache
    const cacheKey = `files:list:page:${page}:limit:${limit}`;
    const cachedData = await cacheHelpers.get(cacheKey);

    if (cachedData) {
      logger.info("Cache Hit - Files list", { page, limit });
      return NextResponse.json({
        success: true,
        ...(typeof cachedData === "object" && cachedData !== null
          ? cachedData
          : {}),
        source: "cache",
      });
    }

    // Cache miss - fetch from database
    logger.info("Cache Miss - Files list", { page, limit });

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.file.count(),
    ]);

    const result = {
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the result for 60 seconds
    await cacheHelpers.set(cacheKey, result, 60);

    logger.info("Files retrieved successfully", { count: files.length, total });

    return NextResponse.json({
      success: true,
      ...result,
      source: "database",
    });
  } catch (error) {
    return handleError(error, "GET /api/files");
  }
}

// POST /api/files - Store file metadata
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = fileMetadataSchema.parse(body);
    const { fileName, fileURL, fileType, fileSize, uploadedBy } = validatedData;

    // Create file record in database
    const file = await prisma.file.create({
      data: {
        name: fileName,
        url: fileURL,
        fileType,
        fileSize,
        uploadedBy,
      },
      include: {
        uploader: uploadedBy
          ? {
              select: {
                id: true,
                name: true,
                email: true,
              },
            }
          : false,
      },
    });

    // Invalidate cache
    await cacheHelpers.delPattern("files:list:*");

    logger.info("File metadata stored successfully", {
      fileId: file.id,
      fileName,
      uploadedBy,
    });

    return NextResponse.json(
      {
        success: true,
        file,
        message: "File metadata stored successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "POST /api/files");
  }
}
