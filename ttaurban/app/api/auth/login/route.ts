import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import { loginSchema } from "../../../lib/schemas/authSchema";
import { handleError } from "../../../lib/errorHandler";
import { generateTokenPair } from "../../../lib/jwt";

/**
 * POST /api/auth/login
 * User authentication endpoint with JWT token generation
 *
 * Request Body:
 * {
 *   "email": "string",
 *   "password": "string"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Zod Validation
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Generate JWT token pair (access + refresh tokens)
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Create response with access token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set refresh token as HTTP-only cookie for security
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/", // Available on all routes
    });

    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/login");
  }
}
