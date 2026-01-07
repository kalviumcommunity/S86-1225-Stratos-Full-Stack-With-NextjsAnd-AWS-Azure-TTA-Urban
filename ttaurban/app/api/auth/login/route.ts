import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import { loginSchema } from "../../../lib/schemas/authSchema";
import { handleError } from "../../../lib/errorHandler";
import { generateTokenPair } from "../../../lib/jwt";
import {
  sanitizeEmail,
  sanitizeInput,
  logSecurityEvent,
  SanitizationLevel,
} from "../../../lib/sanitize";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User authentication
 *     description: Authenticates a user with email and password, returns JWT access token and sets refresh token cookie
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User's password
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (valid for 24 hours)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [CITIZEN, OFFICER, ADMIN]
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie (valid for 7 days)
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
 *       400:
 *         description: Invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Invalid email format
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Invalid credentials
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: User not found
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Sanitize input first
    const sanitizedEmail = sanitizeEmail(body.email);
    if (!sanitizedEmail) {
      logSecurityEvent("invalid_email_login_attempt", { email: body.email });
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const sanitizedBody = {
      email: sanitizedEmail,
      password: sanitizeInput(body.password, SanitizationLevel.STRICT),
    };

    // Zod Validation
    const validatedData = loginSchema.parse(sanitizedBody);

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
