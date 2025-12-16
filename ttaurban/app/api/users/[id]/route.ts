import { NextResponse } from 'next/server';
import { sendSuccess, sendError } from '../../../../lib/responseHandler';
import { ERROR_CODES } from '../../../../lib/errorCodes';

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
      return sendError('Invalid user ID', ERROR_CODES.VALIDATION_ERROR, 400);
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
      return sendError(`User with ID ${userId} not found`, ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(mockUser, 'User fetched successfully');
  } catch (error) {
    console.error('Error fetching user:', error);
    return sendError('Failed to fetch user', ERROR_CODES.INTERNAL_ERROR, 500, error);
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
      return sendError('Invalid user ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const body = await req.json();

    // Validation
    if (!body.name || !body.email) {
      return sendError('Missing required fields: name, email', ERROR_CODES.VALIDATION_ERROR, 400);
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

    return sendSuccess(updatedUser, 'User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    return sendError('Failed to update user', ERROR_CODES.INTERNAL_ERROR, 500, error);
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
      return sendError('Invalid user ID', ERROR_CODES.VALIDATION_ERROR, 400);
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

    return sendSuccess(patchedUser, 'User patched successfully');
  } catch (error) {
    console.error('Error patching user:', error);
    return sendError('Failed to update user', ERROR_CODES.INTERNAL_ERROR, 500, error);
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
      return sendError('Invalid user ID', ERROR_CODES.VALIDATION_ERROR, 400);
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

    return sendSuccess(deletedUser, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    return sendError('Failed to delete user', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
