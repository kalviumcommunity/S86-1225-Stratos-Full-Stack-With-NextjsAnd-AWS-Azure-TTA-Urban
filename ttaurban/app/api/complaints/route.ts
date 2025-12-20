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

/**
 * GET /api/complaints
 * Returns a paginated list of all complaints
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - status: string (optional, filter by status)
 * - priority: string (optional, filter by priority)
 * - category: string (optional, filter by category)
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
 * POST /api/complaints
 * Creates a new complaint with Zod validation
 *
 * Request Body:
 * {
 *   "title": "string",
 *   "description": "string",
 *   "category": "INFRASTRUCTURE" | "TRAFFIC" | "SANITATION" | "OTHER",
 *   "latitude": "number?",
 *   "longitude": "number?",
 *   "address": "string?",
 *   "imageUrl": "string?"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Zod Validation
    const validatedData = createComplaintSchema.parse(body);

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
