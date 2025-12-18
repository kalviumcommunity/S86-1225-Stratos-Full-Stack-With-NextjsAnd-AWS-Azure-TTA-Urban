import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
} from "../../lib/responseHandler";
import { ERROR_CODES } from "../../lib/errorCodes";
import { getPaginationParams } from "../utils/pagination";
import { prisma } from "../../lib/prisma";
import { createUserSchema } from "../../lib/schemas/userSchema";
import { ZodError } from "zod";

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
 * Creates a new user with Zod validation
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

    // Zod Validation
    const validatedData = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return sendError(
        "Email already registered",
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        409
      );
    }

    // Hash the password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user with hashed password
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        role: validatedData.role,
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
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error creating user:", error);
    return sendError(
      "Failed to create user",
      ERROR_CODES.USER_CREATION_FAILED,
      500,
      error
    );
  }
}
