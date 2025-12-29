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
import { sanitizeEmail, sanitizeInput, sanitizePhone, sanitizeObject, SanitizationLevel, logSecurityEvent } from "../../lib/sanitize";

/**
 * GET /api/users
 * Returns a paginated list of all users with Redis caching
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 *
 * Cache Strategy:
 * - Cache key: users:list:page:{page}:limit:{limit}
 * - TTL: 60 seconds
 * - Invalidated on: POST (create), PUT/PATCH (update), DELETE
 *
 * @requires Permission: READ_USER
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
 * POST /api/users
 * Creates a new user with Zod validation
 * Invalidates users list cache after creation
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "email": "string",
 *   "password": "string",
 *   "phone": "string?",
 *   "role": "ADMIN" | "EDITOR" | "VIEWER" | "USER"
 * }
 *
 * @requires Permission: CREATE_USER
 */
export const POST = withPermission(
  Permission.CREATE_USER,
  async (req: NextRequest, user) => {
    try {
      const body = await req.json();

      // Sanitize input first
      const sanitizedEmail = sanitizeEmail(body.email);
      if (!sanitizedEmail) {
        logSecurityEvent('invalid_email_user_creation', { email: body.email });
        return sendError("Invalid email format", ERROR_CODES.VALIDATION_ERROR, 400);
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
