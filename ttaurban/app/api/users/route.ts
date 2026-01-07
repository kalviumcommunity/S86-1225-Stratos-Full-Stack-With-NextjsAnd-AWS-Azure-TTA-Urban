import { NextResponse, NextRequest } from "next/server";
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
import { handleError } from "../../lib/errorHandler";
import { cacheHelpers } from "../../lib/redis";
import { logger } from "../../lib/logger";
import { withPermission } from "../../lib/authMiddleware";
import { Permission } from "@/app/config/roles";
import {
  sanitizeEmail,
  sanitizeInput,
  sanitizePhone,
  sanitizeObject,
  SanitizationLevel,
  logSecurityEvent,
} from "../../lib/sanitize";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Returns a paginated list of all users with Redis caching. Requires READ_USER permission.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = withPermission(
  Permission.READ_USER,
  async (req: NextRequest, user) => {
    try {
      const { page, limit, skip } = getPaginationParams(req);

      // Generate cache key based on pagination params
      const cacheKey = `users:list:page:${page}:limit:${limit}`;

      // Check cache first (Cache-Aside pattern)
      const cachedData = await cacheHelpers.get<{
        users: any[];
        total: number;
      }>(cacheKey);

      if (cachedData) {
        logger.info("Cache Hit", { key: cacheKey });
        return sendPaginatedSuccess(
          cachedData.users,
          page,
          limit,
          cachedData.total,
          "Users fetched successfully (cached)"
        );
      }

      // Cache Miss - Fetch from database
      logger.info("Cache Miss - Fetching from DB", { key: cacheKey });

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

      // Cache the result with 60 second TTL
      await cacheHelpers.set(cacheKey, { users, total }, 60);

      return sendPaginatedSuccess(
        users,
        page,
        limit,
        total,
        "Users fetched successfully"
      );
    } catch (error) {
      return handleError(error, "GET /api/users");
    }
  }
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user
 *     description: Creates a new user with validated input and hashed password. Requires CREATE_USER permission. Invalidates user cache.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 format: password
 *                 example: SecurePassword123!
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *                 example: "+911234567890"
 *               role:
 *                 type: string
 *                 enum: [CITIZEN, OFFICER, ADMIN]
 *                 example: CITIZEN
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const POST = withPermission(
  Permission.CREATE_USER,
  async (req: NextRequest, user) => {
    try {
      const body = await req.json();

      // Sanitize input first
      const sanitizedEmail = sanitizeEmail(body.email);
      if (!sanitizedEmail) {
        logSecurityEvent("invalid_email_user_creation", { email: body.email });
        return sendError(
          "Invalid email format",
          ERROR_CODES.VALIDATION_ERROR,
          400
        );
      }

      const sanitizedBody = {
        name: sanitizeInput(body.name, SanitizationLevel.STRICT),
        email: sanitizedEmail,
        password: body.password, // Don't sanitize password - let bcrypt handle it
        phone: body.phone ? sanitizePhone(body.phone) : undefined,
        role: body.role,
      };

      // Zod Validation
      const validatedData = createUserSchema.parse(sanitizedBody);

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

      // Invalidate all users list cache (pattern match)
      await cacheHelpers.delPattern("users:list:*");
      logger.info("Cache invalidated", { pattern: "users:list:*" });

      return sendSuccess(user, "User created successfully", 201);
    } catch (error) {
      return handleError(error, "POST /api/users");
    }
  }
);
