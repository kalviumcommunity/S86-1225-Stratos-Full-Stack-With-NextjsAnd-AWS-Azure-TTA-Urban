import { NextResponse } from 'next/server';
import { sendSuccess, sendError } from '../../../../lib/responseHandler';
import { ERROR_CODES } from '../../../../lib/errorCodes';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/departments/[id]
 * Returns a specific department by ID with complaint statistics
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const deptId = parseInt(params.id);

    if (isNaN(deptId)) {
      return sendError('Invalid department ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // TODO: Fetch from database with statistics
    // const department = await prisma.department.findUnique({
    //   where: { id: deptId },
    //   include: {
    //     _count: { select: { complaints: true } },
    //     complaints: { take: 5, orderBy: { createdAt: 'desc' } },
    //   },
    // });

    // Mock response
    const mockDepartment = {
      id: deptId,
      name: 'Traffic Department',
      description: 'Handles traffic and transportation issues',
      complaintCount: 45,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!mockDepartment) {
      return sendError(`Department with ID ${deptId} not found`, ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(mockDepartment, 'Department fetched successfully');
  } catch (error) {
    console.error('Error fetching department:', error);
    return sendError('Failed to fetch department', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

/**
 * PUT /api/departments/[id]
 * Updates entire department
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "description": "string?"
 * }
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const deptId = parseInt(params.id);

    if (isNaN(deptId)) {
      return sendError('Invalid department ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const body = await req.json();

    // Validation
    if (!body.name) {
      return sendError('Missing required field: name', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // TODO: Update department
    // const updatedDept = await prisma.department.update({
    //   where: { id: deptId },
    //   data: {
    //     name: body.name,
    //     description: body.description,
    //   },
    // });

    // Mock response
    const updatedDept = {
      id: deptId,
      name: body.name,
      description: body.description,
      updatedAt: new Date(),
    };

    return sendSuccess(updatedDept, 'Department updated successfully');
  } catch (error) {
    console.error('Error updating department:', error);
    return sendError('Failed to update department', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

/**
 * PATCH /api/departments/[id]
 * Partially updates department
 *
 * Request Body (all fields optional):
 * {
 *   "name": "string?",
 *   "description": "string?"
 * }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const deptId = parseInt(params.id);

    if (isNaN(deptId)) {
      return sendError('Invalid department ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const body = await req.json();

    // TODO: Partial update
    // const patchedDept = await prisma.department.update({
    //   where: { id: deptId },
    //   data: body,
    // });

    // Mock response
    const patchedDept = {
      id: deptId,
      ...body,
      updatedAt: new Date(),
    };

    return sendSuccess(patchedDept, 'Department patched successfully');
  } catch (error) {
    console.error('Error patching department:', error);
    return sendError('Failed to update department', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

/**
 * DELETE /api/departments/[id]
 * Deletes a department by ID
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const deptId = parseInt(params.id);

    if (isNaN(deptId)) {
      return sendError('Invalid department ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // TODO: Check if department has associated complaints
    // const complaintCount = await prisma.complaint.count({
    //   where: { departmentId: deptId },
    // });
    // if (complaintCount > 0) {
    //   return ApiResponse.conflict('Cannot delete department with associated complaints');
    // }

    // TODO: Delete department
    // const deletedDept = await prisma.department.delete({
    //   where: { id: deptId },
    // });

    // Mock response
    const response = {
      id: deptId,
      message: 'Department deleted successfully',
    };

    return sendSuccess(response, 'Department deleted successfully');
  } catch (error) {
    console.error('Error deleting department:', error);
    return sendError('Failed to delete department', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
