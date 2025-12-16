import { NextResponse } from 'next/server';
import { sendSuccess, sendError } from '../../../../lib/responseHandler';
import { ERROR_CODES } from '../../../../lib/errorCodes';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/complaints/[id]
 * Returns a specific complaint by ID
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const complaintId = parseInt(params.id);

    if (isNaN(complaintId)) {
      return sendError('Invalid complaint ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // TODO: Fetch from database with relations
    // const complaint = await prisma.complaint.findUnique({
    //   where: { id: complaintId },
    //   include: {
    //     user: { select: { id: true, name: true, email: true } },
    //     department: { select: { id: true, name: true } },
    //     feedback: true,
    //     notifications: true,
    //   },
    // });

    // Mock response
    const mockComplaint = {
      id: complaintId,
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic hazard',
      category: 'INFRASTRUCTURE',
      status: 'SUBMITTED',
      priority: 'HIGH',
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.006,
      imageUrl: 'https://example.com/image.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!mockComplaint) {
      return sendError(`Complaint with ID ${complaintId} not found`, ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(mockComplaint, 'Complaint fetched successfully');
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return sendError('Failed to fetch complaint', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

/**
 * PUT /api/complaints/[id]
 * Updates entire complaint (full update)
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
    const complaintId = parseInt(params.id);

    if (isNaN(complaintId)) {
      return sendError('Invalid complaint ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const body = await req.json();

    // Validation
    if (!body.title || !body.description || !body.category) {
      return sendError('Missing required fields: title, description, category', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // TODO: Update complaint in database
    // const updatedComplaint = await prisma.complaint.update({
    //   where: { id: complaintId },
    //   data: {
    //     title: body.title,
    //     description: body.description,
    //     category: body.category,
    //     status: body.status,
    //     priority: body.priority,
    //     address: body.address,
    //     latitude: body.latitude,
    //     longitude: body.longitude,
    //   },
    // });

    // Mock response
    const updatedComplaint = {
      id: complaintId,
      title: body.title,
      description: body.description,
      category: body.category,
      status: body.status || 'SUBMITTED',
      priority: body.priority || 'MEDIUM',
      updatedAt: new Date(),
    };

    return sendSuccess(updatedComplaint, 'Complaint updated successfully');
  } catch (error) {
    console.error('Error updating complaint:', error);
    return sendError('Failed to update complaint', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

/**
 * PATCH /api/complaints/[id]
 * Partially updates complaint (only specified fields)
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
    const complaintId = parseInt(params.id);

    if (isNaN(complaintId)) {
      return sendError('Invalid complaint ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const body = await req.json();

    // TODO: Partial update
    // const patchedComplaint = await prisma.complaint.update({
    //   where: { id: complaintId },
    //   data: body,
    // });

    // Mock response
    const patchedComplaint = {
      id: complaintId,
      ...body,
      updatedAt: new Date(),
    };

    return sendSuccess(patchedComplaint, 'Complaint patched successfully');
  } catch (error) {
    console.error('Error patching complaint:', error);
    return sendError('Failed to update complaint', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

/**
 * DELETE /api/complaints/[id]
 * Deletes a complaint by ID
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const complaintId = parseInt(params.id);

    if (isNaN(complaintId)) {
      return sendError('Invalid complaint ID', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // TODO: Delete from database
    // const deletedComplaint = await prisma.complaint.delete({
    //   where: { id: complaintId },
    // });

    // Mock response
    const response = {
      id: complaintId,
      message: 'Complaint deleted successfully',
    };

    return sendSuccess(response, 'Complaint deleted successfully');
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return sendError('Failed to delete complaint', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
