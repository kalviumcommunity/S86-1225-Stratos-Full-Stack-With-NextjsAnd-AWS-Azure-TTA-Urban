import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import { signupSchema } from "../../../lib/schemas/authSchema";
import { handleError } from "../../../lib/errorHandler";
import { generateTokenPair } from "../../../lib/jwt";
import { sanitizeEmail, sanitizeInput, sanitizePhone, SanitizationLevel, logSecurityEvent } from "../../../lib/sanitize";

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

    // OWASP Compliance: Sanitize user inputs
    const sanitizedEmail = sanitizeEmail(body.email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    const sanitizedBody = {
      ...body,
      name: sanitizeInput(body.name, SanitizationLevel.STRICT),
      email: sanitizedEmail,
      phone: body.phone ? sanitizePhone(body.phone) : undefined,
    };

    // Zod Validation (on sanitized data)
    const validatedData = signupSchema.parse(sanitizedBody);

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

    // Generate JWT token pair for automatic login
    const { accessToken, refreshToken } = generateTokenPair({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    // Create response with access token
    const response = NextResponse.json(
      {
        success: true,
        message: "Signup successful",
        accessToken,
        user: newUser,
      },
      { status: 201 }
    );

    // Set refresh token as HTTP-only cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/signup");
  }
}
