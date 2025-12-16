import { NextResponse } from 'next/server';
import { ApiResponse } from '../../utils/response';

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
      return ApiResponse.badRequest('Invalid department ID');
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
      return ApiResponse.notFound(`Department with ID ${deptId} not found`);
    }

    return ApiResponse.success(mockDepartment);
  } catch (error) {
    console.error('Error fetching department:', error);
    return ApiResponse.serverError('Failed to fetch department');
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
      return ApiResponse.badRequest('Invalid department ID');
    }

    const body = await req.json();

    // Validation
    if (!body.name) {
      return ApiResponse.badRequest('Missing required field: name');
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

    return ApiResponse.success(updatedDept);
  } catch (error) {
    console.error('Error updating department:', error);
    return ApiResponse.serverError('Failed to update department');
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
      return ApiResponse.badRequest('Invalid department ID');
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

    return ApiResponse.success(patchedDept);
  } catch (error) {
    console.error('Error patching department:', error);
    return ApiResponse.serverError('Failed to update department');
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
      return ApiResponse.badRequest('Invalid department ID');
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

    return ApiResponse.success(response);
  } catch (error) {
    console.error('Error deleting department:', error);
    return ApiResponse.serverError('Failed to delete department');
  }
}
