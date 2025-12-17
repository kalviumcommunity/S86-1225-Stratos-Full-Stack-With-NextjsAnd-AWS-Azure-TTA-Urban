import { NextResponse } from "next/server";
import {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
} from "../../lib/responseHandler";
import { ERROR_CODES } from "../../lib/errorCodes";
import { getPaginationParams } from "../utils/pagination";
import { prisma } from "../../lib/prisma";
import { createDepartmentSchema } from "../../lib/schemas/departmentSchema";
import { ZodError } from "zod";

/**
 * GET /api/departments
 * Returns a paginated list of all departments
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 */
export async function GET(req: Request) {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        skip,
        take: limit,
        include: {
          _count: { select: { complaints: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.department.count(),
    ]);

    return sendPaginatedSuccess(
      departments,
      page,
      limit,
      total,
      "Departments fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching departments:", error);
    return sendError(
      "Failed to fetch departments",
      ERROR_CODES.DEPARTMENT_FETCH_ERROR,
      500,
      error
    );
  }
}

/**
 * POST /api/departments
 * Creates a new department with Zod validation
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "description": "string?"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Zod Validation
    const validatedData = createDepartmentSchema.parse(body);

    // Check if department already exists
    const existingDept = await prisma.department.findUnique({
      where: { name: validatedData.name },
    });
    if (existingDept) {
      return sendError(
        "Department with this name already exists",
        ERROR_CODES.DEPARTMENT_NAME_EXISTS,
        409
      );
    }

    // Create department
    const newDepartment = await prisma.department.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    });

    return sendSuccess(newDepartment, "Department created successfully", 201);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error creating department:", error);
    return sendError(
      "Failed to create department",
      ERROR_CODES.DEPARTMENT_CREATION_FAILED,
      500,
      error
    );
  }
}
