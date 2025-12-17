import { NextResponse } from "next/server";
import { ApiResponse } from "../../utils/response";
import { prisma } from "../../../lib/prisma";

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
    console.error("Error fetching user:", error);
    return ApiResponse.serverError("Failed to fetch user");
  }
}

/**
 * PUT /api/users/[id]
 * Updates entire user (replace all fields)
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

    // Validation
    if (!body.name || !body.email) {
      return ApiResponse.badRequest("Missing required fields: name, email");
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
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
    console.error("Error updating user:", error);
    return ApiResponse.serverError("Failed to update user");
  }
}

/**
 * PATCH /api/users/[id]
 * Partially updates user (only specified fields)
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

    // Partial update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
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
    console.error("Error patching user:", error);
    return ApiResponse.serverError("Failed to update user");
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
    console.error("Error deleting user:", error);
    return ApiResponse.serverError("Failed to delete user");
  }
}
