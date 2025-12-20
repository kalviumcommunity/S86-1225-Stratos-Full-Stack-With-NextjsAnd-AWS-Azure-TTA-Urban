import { NextResponse } from "next/server";
import { ApiResponse } from "../../utils/response";
import { prisma } from "../../../lib/prisma";
import {
  updateComplaintSchema,
  patchComplaintSchema,
} from "../../../lib/schemas/complaintSchema";
import { handleError } from "../../../lib/errorHandler";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/complaints/[id]
 * Returns a specific complaint by ID
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id);

    if (isNaN(complaintId)) {
      return ApiResponse.badRequest("Invalid complaint ID");
    }

    // Fetch from database with relations
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
        officer: { select: { id: true, name: true, email: true } },
        feedback: true,
        auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!complaint) {
      return ApiResponse.notFound(`Complaint with ID ${complaintId} not found`);
    }

    return ApiResponse.success(complaint);
  } catch (error) {
    return handleError(error, "GET /api/complaints/[id]");
  }
}

/**
 * PUT /api/complaints/[id]
 * Updates entire complaint with Zod validation (full update)
 *
 * Request Body:
 * {
 *   "title": "string",
 *   "description": "string",
 *   "category": "string",
 *   "status": "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
 *   "priority": "LOW" | "MEDIUM" | "HIGH",
 *   "address": "string?",
 *   "latitude": "number?",
 *   "longitude": "number?"
 * }
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id);

    if (isNaN(complaintId)) {
      return ApiResponse.badRequest("Invalid complaint ID");
    }

    const body = await req.json();

    // Zod Validation
    const validatedData = updateComplaintSchema.parse(body);

    // Update complaint in database
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        status: validatedData.status,
        priority: validatedData.priority,
        address: validatedData.address,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        departmentId: validatedData.departmentId,
        assignedTo: validatedData.assignedTo,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
        officer: { select: { id: true, name: true, email: true } },
      },
    });

    return ApiResponse.success(updatedComplaint);
  } catch (error) {
    return handleError(error, "PUT /api/complaints/[id]");
  }
}

/**
 * PATCH /api/complaints/[id]
 * Partially updates complaint with Zod validation (only specified fields)
 *
 * Request Body (all fields optional):
 * {
 *   "status": "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"?,
 *   "priority": "LOW" | "MEDIUM" | "HIGH"?,
 *   "description": "string?"
 * }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id);

    if (isNaN(complaintId)) {
      return ApiResponse.badRequest("Invalid complaint ID");
    }

    const body = await req.json();

    // Zod Validation
    const validatedData = patchComplaintSchema.parse(body);

    // Partial update
    const patchedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: validatedData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return ApiResponse.success(patchedComplaint);
  } catch (error) {
    return handleError(error, "PATCH /api/complaints/[id]");
  }
}

/**
 * DELETE /api/complaints/[id]
 * Deletes a complaint by ID
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id);

    if (isNaN(complaintId)) {
      return ApiResponse.badRequest("Invalid complaint ID");
    }

    // Delete from database (cascade will delete related records)
    const deletedComplaint = await prisma.complaint.delete({
      where: { id: complaintId },
      select: {
        id: true,
        title: true,
      },
    });

    return ApiResponse.success({
      ...deletedComplaint,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    return handleError(error, "DELETE /api/complaints/[id]");
  }
}
