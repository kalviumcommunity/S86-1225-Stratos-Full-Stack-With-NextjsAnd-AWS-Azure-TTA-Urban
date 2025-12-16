import { NextResponse } from 'next/server';
import { ApiResponse } from '../utils/response';
import { getPaginationParams } from '../utils/pagination';

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
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    // TODO: Build Prisma query with filters
    // const whereClause: any = {};
    // if (status) whereClause.status = status;
    // if (priority) whereClause.priority = priority;
    // if (category) whereClause.category = category;

    // const [complaints, total] = await Promise.all([
    //   prisma.complaint.findMany({
    //     where: whereClause,
    //     skip,
    //     take: limit,
    //     include: {
    //       user: { select: { id: true, name: true, email: true } },
    //       department: { select: { id: true, name: true } },
    //     },
    //   }),
    //   prisma.complaint.count({ where: whereClause }),
    // ]);

    // Mock data for demonstration
    const mockComplaints = [
      {
        id: 1,
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic hazard',
        category: 'INFRASTRUCTURE',
        status: 'SUBMITTED',
        priority: 'HIGH',
        address: '123 Main St',
        createdAt: new Date(),
      },
      {
        id: 2,
        title: 'Illegal parking',
        description: 'Vehicle parked illegally in no-parking zone',
        category: 'TRAFFIC',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        address: '456 Oak Ave',
        createdAt: new Date(),
      },
    ];

    const total = mockComplaints.length;
    const paginatedComplaints = mockComplaints.slice(skip, skip + limit);

    return ApiResponse.paginated(paginatedComplaints, page, limit, total);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return ApiResponse.serverError('Failed to fetch complaints');
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
      return ApiResponse.badRequest('Missing required fields: title, description, category');
    }

    if (body.title.length < 3) {
      return ApiResponse.badRequest('Title must be at least 3 characters long');
    }

    if (body.description.length < 10) {
      return ApiResponse.badRequest('Description must be at least 10 characters long');
    }

    // TODO: Create complaint in database
    // const complaint = await prisma.complaint.create({
    //   data: {
    //     title: body.title,
    //     description: body.description,
    //     category: body.category,
    //     latitude: body.latitude,
    //     longitude: body.longitude,
    //     address: body.address,
    //     imageUrl: body.imageUrl,
    //     status: 'SUBMITTED',
    //     priority: 'MEDIUM',
    //     userId: userId, // From authenticated user
    //   },
    // });

    // Mock response
    const newComplaint = {
      id: 3,
      title: body.title,
      description: body.description,
      category: body.category,
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      address: body.address,
      createdAt: new Date(),
    };

    return ApiResponse.created(newComplaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    return ApiResponse.serverError('Failed to create complaint');
  }
}
