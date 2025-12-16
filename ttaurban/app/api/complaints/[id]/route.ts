import { NextResponse } from 'next/server';
import { ApiResponse } from '../../utils/response';

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
      return ApiResponse.badRequest('Invalid complaint ID');
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
      return ApiResponse.notFound(`Complaint with ID ${complaintId} not found`);
    }

    return ApiResponse.success(mockComplaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return ApiResponse.serverError('Failed to fetch complaint');
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
      return ApiResponse.badRequest('Invalid complaint ID');
    }

    const body = await req.json();

    // Validation
    if (!body.title || !body.description || !body.category) {
      return ApiResponse.badRequest('Missing required fields: title, description, category');
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

    return ApiResponse.success(updatedComplaint);
  } catch (error) {
    console.error('Error updating complaint:', error);
    return ApiResponse.serverError('Failed to update complaint');
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
      return ApiResponse.badRequest('Invalid complaint ID');
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

    return ApiResponse.success(patchedComplaint);
  } catch (error) {
    console.error('Error patching complaint:', error);
    return ApiResponse.serverError('Failed to update complaint');
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
      return ApiResponse.badRequest('Invalid complaint ID');
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

    return ApiResponse.success(response);
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return ApiResponse.serverError('Failed to delete complaint');
  }
}
