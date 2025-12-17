import { NextResponse } from "next/server";
import {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
} from "../../lib/responseHandler";
import { ERROR_CODES } from "../../lib/errorCodes";
import { getPaginationParams } from "../utils/pagination";
import { prisma } from "../../lib/prisma";

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
    console.error("Error fetching complaints:", error);
    return sendError(
      "Failed to fetch complaints",
      ERROR_CODES.COMPLAINT_FETCH_ERROR,
      500,
      error
    );
  }
}

/**
 * POST /api/complaints
 * Creates a new complaint
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

    // Validation
    if (!body.title || !body.description || !body.category) {
      return sendError(
        "Missing required fields: title, description, category",
        ERROR_CODES.MISSING_REQUIRED_FIELDS,
        400
      );
    }

    if (body.title.length < 3) {
      return sendError(
        "Title must be at least 3 characters long",
        ERROR_CODES.INVALID_FIELD_LENGTH,
        400
      );
    }

    if (body.description.length < 10) {
      return sendError(
        "Description must be at least 10 characters long",
        ERROR_CODES.INVALID_FIELD_LENGTH,
        400
      );
    }

    // TODO: Create complaint in database
    // const complaint = await prisma.complaint.create({
    // Create complaint
    // Note: In production, get userId from authenticated session
    const userId = body.userId || 1; // Default to user ID 1 for testing

    const newComplaint = await prisma.complaint.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        imageUrl: body.imageUrl,
        status: "SUBMITTED",
        priority: body.priority || "MEDIUM",
        userId: userId,
        departmentId: body.departmentId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return sendSuccess(newComplaint, "Complaint created successfully", 201);
  } catch (error) {
    console.error("Error creating complaint:", error);
    return sendError(
      "Failed to create complaint",
      ERROR_CODES.COMPLAINT_CREATION_FAILED,
      500,
      error
    );
  }
}
