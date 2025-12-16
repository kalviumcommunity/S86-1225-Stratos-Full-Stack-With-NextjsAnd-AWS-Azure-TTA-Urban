import { NextResponse } from 'next/server';
import { ApiResponse } from '../../utils/response';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/users/[id]
 * Returns a specific user by ID
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return ApiResponse.badRequest('Invalid user ID');
    }

    // TODO: Fetch from database
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   select: {
    //     id: true,
    //     name: true,
    //     email: true,
    //     role: true,
    //     createdAt: true,
    //     updatedAt: true,
    //   },
    // });

    // Mock response
    const mockUser = {
      id: userId,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'CITIZEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!mockUser) {
      return ApiResponse.notFound(`User with ID ${userId} not found`);
    }

    return ApiResponse.success(mockUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return ApiResponse.serverError('Failed to fetch user');
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
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return ApiResponse.badRequest('Invalid user ID');
    }

    const body = await req.json();

    // Validation
    if (!body.name || !body.email) {
      return ApiResponse.badRequest('Missing required fields: name, email');
    }

    // TODO: Update user
    // const updatedUser = await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     name: body.name,
    //     email: body.email,
    //     phone: body.phone,
    //     role: body.role,
    //   },
    // });

    // Mock response
    const updatedUser = {
      id: userId,
      name: body.name,
      email: body.email,
      role: body.role || 'CITIZEN',
      updatedAt: new Date(),
    };

    return ApiResponse.success(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return ApiResponse.serverError('Failed to update user');
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
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return ApiResponse.badRequest('Invalid user ID');
    }

    const body = await req.json();

    // TODO: Partial update
    // const updatedUser = await prisma.user.update({
    //   where: { id: userId },
    //   data: body,
    // });

    // Mock response
    const patchedUser = {
      id: userId,
      ...body,
      updatedAt: new Date(),
    };

    return ApiResponse.success(patchedUser);
  } catch (error) {
    console.error('Error patching user:', error);
    return ApiResponse.serverError('Failed to update user');
  }
}

/**
 * DELETE /api/users/[id]
 * Deletes a user by ID
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return ApiResponse.badRequest('Invalid user ID');
    }

    // TODO: Delete from database
    // const deletedUser = await prisma.user.delete({
    //   where: { id: userId },
    // });

    // Mock response
    const deletedUser = {
      id: userId,
      message: 'User deleted successfully',
    };

    return ApiResponse.success(deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error);
    return ApiResponse.serverError('Failed to delete user');
  }
}
