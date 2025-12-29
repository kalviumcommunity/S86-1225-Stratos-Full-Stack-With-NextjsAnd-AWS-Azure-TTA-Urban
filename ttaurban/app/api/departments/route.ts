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
import { handleError } from "../../lib/errorHandler";
import { sanitizeObject, SanitizationLevel } from "../../lib/sanitize";

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
    return handleError(error, "GET /api/departments");
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

    // Sanitize input
    const sanitizedBody = sanitizeObject(body, SanitizationLevel.BASIC);

    // Zod Validation
    const validatedData = createDepartmentSchema.parse(sanitizedBody);

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
    return handleError(error, "POST /api/departments");
  }
}
