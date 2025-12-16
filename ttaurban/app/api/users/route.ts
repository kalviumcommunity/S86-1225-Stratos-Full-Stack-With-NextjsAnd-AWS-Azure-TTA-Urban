import { NextResponse } from 'next/server';
import { getPaginationParams } from '../utils/pagination';
import { sendSuccess, sendError } from '../../../lib/responseHandler';
import { ERROR_CODES } from '../../../lib/errorCodes';

/**
 * GET /api/users
 * Returns a paginated list of all users
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 */
export async function GET(req: Request) {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    // TODO: Replace with Prisma query
    // const [users, total] = await Promise.all([
    //   prisma.user.findMany({
    //     skip,
    //     take: limit,
    //     select: {
    //       id: true,
    //       name: true,
    //       email: true,
    //       role: true,
    //       createdAt: true,
    //     },
    //   }),
    //   prisma.user.count(),
    // ]);

    // Mock data for demonstration
    const mockUsers = [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'CITIZEN', createdAt: new Date() },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'OFFICER', createdAt: new Date() },
      { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'ADMIN', createdAt: new Date() },
    ];

    const total = mockUsers.length;
    const paginatedUsers = mockUsers.slice(skip, skip + limit);

    return sendSuccess(
      { items: paginatedUsers, meta: { page, limit, total } },
      'Users fetched successfully'
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return sendError('Failed to fetch users', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

/**
 * POST /api/users
 * Creates a new user
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "email": "string",
 *   "password": "string",
 *   "phone": "string?",
 *   "role": "CITIZEN" | "OFFICER" | "ADMIN"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation
    if (!body.name || !body.email || !body.password) {
      return sendError('Missing required fields: name, email, password', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return sendError('Invalid email format', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // TODO: Check if email already exists
    // const existingUser = await prisma.user.findUnique({
    //   where: { email: body.email },
    // });
    // if (existingUser) {
    //   return ApiResponse.conflict('Email already registered');
    // }

    // TODO: Hash password and create user
    // const user = await prisma.user.create({
    //   data: {
    //     name: body.name,
    //     email: body.email,
    //     password: hashedPassword,
    //     phone: body.phone,
    //     role: body.role || 'CITIZEN',
    //   },
    // });

    // Mock response
    const newUser = {
      id: 4,
      name: body.name,
      email: body.email,
      role: body.role || 'CITIZEN',
      createdAt: new Date(),
    };

    return sendSuccess(newUser, 'User created', 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return sendError('Failed to create user', ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
