import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import { signupSchema } from "../../../lib/schemas/authSchema";
import { handleError } from "../../../lib/errorHandler";
import { generateTokenPair } from "../../../lib/jwt";
import {
  sanitizeEmail,
  sanitizeInput,
  sanitizePhone,
  SanitizationLevel,
  logSecurityEvent,
} from "../../../lib/sanitize";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Register a new user with email, password, and profile information. Returns JWT tokens upon successful registration.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: User's full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique email address
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Password (min 8 characters)
 *                 example: SecurePassword123!
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *                 description: Optional phone number in E.164 format
 *                 example: "+911234567890"
 *               role:
 *                 type: string
 *                 enum: [CITIZEN, OFFICER, ADMIN]
 *                 default: CITIZEN
 *                 description: User role (defaults to CITIZEN)
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: User registered successfully
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
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
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     role:
 *                       type: string
 *                       enum: [CITIZEN, OFFICER, ADMIN]
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidEmail:
 *                 value:
 *                   success: false
 *                   message: Invalid email format
 *               userExists:
 *                 value:
 *                   success: false
 *                   message: User already exists with this email
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
