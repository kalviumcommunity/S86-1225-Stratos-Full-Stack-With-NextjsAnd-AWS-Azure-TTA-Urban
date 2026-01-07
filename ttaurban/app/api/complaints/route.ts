import { NextResponse } from "next/server";
import {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
} from "../../lib/responseHandler";
import { ERROR_CODES } from "../../lib/errorCodes";
import { getPaginationParams } from "../utils/pagination";
import { prisma } from "../../lib/prisma";
import { createComplaintSchema } from "../../lib/schemas/complaintSchema";
import { handleError } from "../../lib/errorHandler";
import {
  sanitizeInput,
  sanitizeObject,
  SanitizationLevel,
} from "../../lib/sanitize";

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: List all complaints
 *     description: Returns a paginated list of complaints with optional filtering by status, priority, and category
 *     tags: [Complaints]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REJECTED]
 *         description: Filter by complaint status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filter by priority level
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [INFRASTRUCTURE, TRAFFIC, SANITATION, WATER, ELECTRICITY, OTHER]
 *         description: Filter by complaint category
 *     responses:
 *       200:
 *         description: Complaints fetched successfully
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
 *                     $ref: '#/components/schemas/Complaint'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function GET(req: Request) {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");

    // Build Prisma query with filters
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (category) whereClause.category = category;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.complaint.count({ where: whereClause }),
    ]);

    return sendPaginatedSuccess(
      complaints,
      page,
      limit,
      total,
      "Complaints fetched successfully"
    );
  } catch (error) {
    return handleError(error, "GET /api/complaints");
  }
}

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create new complaint
 *     description: Submit a new civic complaint with details, location, and optional attachments
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: Broken streetlight on Main Street
 *               description:
 *                 type: string
 *                 minLength: 20
 *                 example: The streetlight near house #45 has been non-functional for 3 days causing safety concerns
 *               category:
 *                 type: string
 *                 enum: [INFRASTRUCTURE, TRAFFIC, SANITATION, WATER, ELECTRICITY, OTHER]
 *                 example: INFRASTRUCTURE
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 28.6139
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 77.2090
 *               location:
 *                 type: string
 *                 example: Main Street, Sector 15
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: URLs of uploaded images/documents
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Complaint'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // OWASP Compliance: Sanitize all user inputs before validation
    const sanitizedBody = sanitizeObject(body, SanitizationLevel.BASIC);

    // Zod Validation (now on sanitized data)
    const validatedData = createComplaintSchema.parse(sanitizedBody);

    // Note: In production, get userId from authenticated session
    const userId = validatedData.userId || 1; // Default to user ID 1 for testing

    const newComplaint = await prisma.complaint.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        address: validatedData.address,
        imageUrl: validatedData.imageUrl,
        status: "SUBMITTED",
        priority: validatedData.priority,
        userId: userId,
        departmentId: validatedData.departmentId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return sendSuccess(newComplaint, "Complaint created successfully", 201);
  } catch (error) {
    return handleError(error, "POST /api/complaints");
  }
}
