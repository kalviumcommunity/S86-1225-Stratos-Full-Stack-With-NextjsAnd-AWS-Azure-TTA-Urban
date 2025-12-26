/**
 * Authentication Middleware
 * Protects API routes by validating JWT tokens
 *
 * Usage:
 * ```typescript
 * import { withAuth } from '@/app/lib/authMiddleware';
 *
 * export const GET = withAuth(async (req, user) => {
 *   // user is automatically available here
 *   return NextResponse.json({ data: user });
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, JWTPayload } from "./jwt";

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Authentication handler type
 */
type AuthenticatedHandler = (
  req: NextRequest,
  user: JWTPayload
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order function to protect API routes
 * Validates JWT token and injects user data
 *
 * @param handler Authenticated route handler
 * @returns Protected route handler
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Extract token from Authorization header
      const token = extractToken(req);

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            message: "Authentication required. No token provided.",
            error: "MISSING_TOKEN",
          },
          { status: 401 }
        );
      }

      // Verify token
      const user = verifyAccessToken(token);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or expired token. Please login again.",
            error: "INVALID_TOKEN",
          },
          { status: 401 }
        );
      }

      // Token is valid, call the handler with user data
      return await handler(req, user);
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
          error: "AUTH_ERROR",
        },
        { status: 401 }
      );
    }
  };
}

/**
 * Role-based access control
 * Checks if user has required role
 *
 * @param allowedRoles Array of allowed roles
 * @param handler Authenticated route handler
 * @returns Protected route handler with role check
 */
export function withRole(
  allowedRoles: string[],
  handler: AuthenticatedHandler
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient permissions. Access denied.",
          error: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    return await handler(req, user);
  });
}

/**
 * Optional authentication
 * Injects user data if token is present, but doesn't require it
 */
export function withOptionalAuth(
  handler: (
    req: NextRequest,
    user: JWTPayload | null
  ) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const token = extractToken(req);

      if (!token) {
        return await handler(req, null);
      }

      const user = verifyAccessToken(token);
      return await handler(req, user);
    } catch (error) {
      console.error("Optional auth middleware error:", error);
      return await handler(req, null);
    }
  };
}
