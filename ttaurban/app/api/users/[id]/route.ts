import { NextResponse } from "next/server";
import { ApiResponse } from "../../utils/response";
import { prisma } from "../../../lib/prisma";
import {
  updateUserSchema,
  patchUserSchema,
} from "../../../lib/schemas/userSchema";
import { handleError } from "../../../lib/errorHandler";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/users/[id]
 * Returns a specific user by ID
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return ApiResponse.badRequest("Invalid user ID");
    }

    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return ApiResponse.notFound(`User with ID ${userId} not found`);
    }

    return ApiResponse.success(user);
  } catch (error) {
    return handleError(error, "GET /api/users/[id]");
  }
}

/**
 * PUT /api/users/[id]
 * Updates entire user with Zod validation (replace all fields)
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "email": "string",
 *   "phone": "string?",
 *   "role": "CITIZEN" | "OFFICER" | "ADMIN"
 * }
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return ApiResponse.badRequest("Invalid user ID");
    }

    const body = await req.json();

    // Zod Validation
    const validatedData = updateUserSchema.parse(body);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        role: validatedData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return ApiResponse.success(updatedUser);
  } catch (error) {
    return handleError(error, "PUT /api/users/[id]");
  }
}

/**
 * PATCH /api/users/[id]
 * Partially updates user with Zod validation (only specified fields)
 *
 * Request Body:
 * {
 *   "name": "string?",
 *   "email": "string?",
 *   "phone": "string?",
 *   "role": "CITIZEN" | "OFFICER" | "ADMIN"?
 * }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return ApiResponse.badRequest("Invalid user ID");
    }

    const body = await req.json();

    // Zod Validation
    const validatedData = patchUserSchema.parse(body);

    // Partial update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return ApiResponse.success(updatedUser);
  } catch (error) {
    return handleError(error, "PATCH /api/users/[id]");
  }
}

/**
 * DELETE /api/users/[id]
 * Deletes a user by ID
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return ApiResponse.badRequest("Invalid user ID");
    }

    // Delete from database (cascade will delete related complaints)
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return ApiResponse.success({
      ...deletedUser,
      message: "User deleted successfully",
    });
  } catch (error) {
    return handleError(error, "DELETE /api/users/[id]");
  }
}
