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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return sendPaginatedSuccess(
      users,
      page,
      limit,
      total,
      "Users fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return sendError(
      "Failed to fetch users",
      ERROR_CODES.USER_FETCH_ERROR,
      500,
      error
    );
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
      return sendError(
        "Missing required fields: name, email, password",
        ERROR_CODES.MISSING_REQUIRED_FIELDS,
        400
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return sendError(
        "Invalid email format",
        ERROR_CODES.INVALID_EMAIL_FORMAT,
        400
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existingUser) {
      return sendError(
        "Email already registered",
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        409
      );
    }

    // Create user (Note: In production, hash the password with bcrypt)
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password, // TODO: Hash this in production
        phone: body.phone,
        role: body.role || "CITIZEN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return sendSuccess(user, "User created successfully", 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return sendError(
      "Failed to create user",
      ERROR_CODES.USER_CREATION_FAILED,
      500,
      error
    );
  }
}
