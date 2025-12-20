import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import { signupSchema } from "../../../lib/schemas/authSchema";
import { handleError } from "../../../lib/errorHandler";

/**
 * POST /api/auth/signup
 * User registration endpoint with secure password hashing
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "email": "string",
 *   "password": "string",
 *   "phone": "string?" (optional),
 *   "role": "CITIZEN" | "OFFICER" | "ADMIN" (default: CITIZEN)
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Zod Validation
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists with this email",
        },
        { status: 400 }
      );
    }

    // Hash the password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create new user with hashed password
    const newUser = await prisma.user.create({
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

    return NextResponse.json(
      {
        success: true,
        message: "Signup successful",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "POST /api/auth/signup");
  }
}
