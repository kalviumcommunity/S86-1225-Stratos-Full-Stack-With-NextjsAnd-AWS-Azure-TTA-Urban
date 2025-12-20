import { NextResponse } from "next/server";
import { ApiResponse } from "../../utils/response";
import { prisma } from "../../../lib/prisma";
import {
  updateDepartmentSchema,
  patchDepartmentSchema,
} from "../../../lib/schemas/departmentSchema";
import { handleError } from "../../../lib/errorHandler";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/departments/[id]
 * Returns a specific department by ID with complaint statistics
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deptId = parseInt(id);

    if (isNaN(deptId)) {
      return ApiResponse.badRequest("Invalid department ID");
    }

    // Fetch from database with statistics
    const department = await prisma.department.findUnique({
      where: { id: deptId },
      include: {
        _count: { select: { complaints: true } },
        complaints: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
      },
    });

    if (!department) {
      return ApiResponse.notFound(`Department with ID ${deptId} not found`);
    }

    return ApiResponse.success(department);
  } catch (error) {
    return handleError(error, "GET /api/departments/[id]");
  }
}

/**
 * PUT /api/departments/[id]
 * Updates entire department with Zod validation
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "description": "string?"
 * }
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deptId = parseInt(id);

    if (isNaN(deptId)) {
      return ApiResponse.badRequest("Invalid department ID");
    }

    const body = await req.json();

    // Zod Validation
    const validatedData = updateDepartmentSchema.parse(body);

    // Update department
    const updatedDept = await prisma.department.update({
      where: { id: deptId },
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    });

    return ApiResponse.success(updatedDept);
  } catch (error) {
    return handleError(error, "PUT /api/departments/[id]");
  }
}

/**
 * PATCH /api/departments/[id]
 * Partially updates department with Zod validation
 *
 * Request Body (all fields optional):
 * {
 *   "name": "string?",
 *   "description": "string?"
 * }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deptId = parseInt(id);

    if (isNaN(deptId)) {
      return ApiResponse.badRequest("Invalid department ID");
    }

    const body = await req.json();

    // Zod Validation
    const validatedData = patchDepartmentSchema.parse(body);

    // Partial update
    const patchedDept = await prisma.department.update({
      where: { id: deptId },
      data: validatedData,
    });

    return ApiResponse.success(patchedDept);
  } catch (error) {
    return handleError(error, "PATCH /api/departments/[id]");
  }
}

/**
 * DELETE /api/departments/[id]
 * Deletes a department by ID
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deptId = parseInt(id);

    if (isNaN(deptId)) {
      return ApiResponse.badRequest("Invalid department ID");
    }

    // Check if department has associated complaints
    const complaintCount = await prisma.complaint.count({
      where: { departmentId: deptId },
    });
    if (complaintCount > 0) {
      return ApiResponse.conflict(
        `Cannot delete department with ${complaintCount} associated complaints. Reassign or delete complaints first.`
      );
    }

    // Delete department
    const deletedDept = await prisma.department.delete({
      where: { id: deptId },
      select: {
        id: true,
        name: true,
      },
    });

    return ApiResponse.success({
      ...deletedDept,
      message: "Department deleted successfully",
    });
  } catch (error) {
    return handleError(error, "DELETE /api/departments/[id]");
  }
}
