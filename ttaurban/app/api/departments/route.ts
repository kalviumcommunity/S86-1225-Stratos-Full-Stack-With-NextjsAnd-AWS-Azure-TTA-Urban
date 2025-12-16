import { NextResponse } from 'next/server';
import { ApiResponse } from '../utils/response';
import { getPaginationParams } from '../utils/pagination';

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

    // TODO: Fetch from database
    // const [departments, total] = await Promise.all([
    //   prisma.department.findMany({
    //     skip,
    //     take: limit,
    //     include: {
    //       _count: { select: { complaints: true } },
    //     },
    //   }),
    //   prisma.department.count(),
    // ]);

    // Mock data for demonstration
    const mockDepartments = [
      { id: 1, name: 'Traffic Department', description: 'Handles traffic and transportation issues' },
      { id: 2, name: 'Sanitation Department', description: 'Manages waste and cleanliness' },
      { id: 3, name: 'Infrastructure Department', description: 'Oversees roads and buildings' },
    ];

    const total = mockDepartments.length;
    const paginatedDepartments = mockDepartments.slice(skip, skip + limit);

    return ApiResponse.paginated(paginatedDepartments, page, limit, total);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return ApiResponse.serverError('Failed to fetch departments');
  }
}

/**
 * POST /api/departments
 * Creates a new department
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

    // Validation
    if (!body.name) {
      return ApiResponse.badRequest('Missing required field: name');
    }

    if (body.name.length < 3) {
      return ApiResponse.badRequest('Department name must be at least 3 characters long');
    }

    // TODO: Check if department already exists
    // const existingDept = await prisma.department.findUnique({
    //   where: { name: body.name },
    // });
    // if (existingDept) {
    //   return ApiResponse.conflict('Department with this name already exists');
    // }

    // TODO: Create department
    // const department = await prisma.department.create({
    //   data: {
    //     name: body.name,
    //     description: body.description,
    //   },
    // });

    // Mock response
    const newDepartment = {
      id: 4,
      name: body.name,
      description: body.description,
      createdAt: new Date(),
    };

    return ApiResponse.created(newDepartment);
  } catch (error) {
    console.error('Error creating department:', error);
    return ApiResponse.serverError('Failed to create department');
  }
}
