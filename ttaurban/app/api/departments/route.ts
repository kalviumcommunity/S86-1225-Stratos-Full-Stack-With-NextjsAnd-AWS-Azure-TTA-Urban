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
 * @swagger
 * /api/departments:
 *   get:
 *     summary: List all departments
 *     description: Returns a paginated list of departments with complaint counts
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Departments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *                 pagination:
 *                   type: object
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
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create new department
 *     description: Creates a new department with unique name
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Public Works
 *               description:
 *                 type: string
 *                 example: Handles infrastructure and maintenance issues
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       409:
 *         description: Department name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
