import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { handleError } from "@/app/lib/errorHandler";
import { logger } from "@/app/lib/logger";
import { cacheHelpers } from "@/app/lib/redis";

// GET /api/files/:id - Get file by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = parseInt(params.id);

    if (isNaN(fileId)) {
      return NextResponse.json(
        { success: false, message: "Invalid file ID" },
        { status: 400 }
      );
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    logger.info("File retrieved successfully", { fileId });

    return NextResponse.json({
      success: true,
      file,
    });
  } catch (error) {
    return handleError(error, `GET /api/files/${params.id}`);
  }
}

// DELETE /api/files/:id - Delete file metadata
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = parseInt(params.id);

    if (isNaN(fileId)) {
      return NextResponse.json(
        { success: false, message: "Invalid file ID" },
        { status: 400 }
      );
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    // Invalidate cache
    await cacheHelpers.delPattern("files:list:*");

    logger.info("File deleted successfully", { fileId });

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return handleError(error, `DELETE /api/files/${params.id}`);
  }
}
