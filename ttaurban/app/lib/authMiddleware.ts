/**
 * Authentication Middleware with RBAC
 * Protects API routes by validating JWT tokens and checking permissions
 *
 * Usage:
 * ```typescript
 * import { withAuth, withPermission } from '@/app/lib/authMiddleware';
 *
 * export const GET = withAuth(async (req, user) => {
 *   // user is automatically available here
 *   return NextResponse.json({ data: user });
 * });
 *
 * export const DELETE = withPermission(Permission.DELETE_USER, async (req, user) => {
 *   // Only users with DELETE_USER permission can access
 *   return NextResponse.json({ message: 'Deleted' });
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, JWTPayload } from "./jwt";
import { Role, Permission, isValidRole } from "@/app/config/roles";
import {
  hasPermission,
  meetsRoleRequirement,
  checkPermission,
  RBACUser,
} from "./rbac";
import { auditLogger, AuditResult } from "./auditLogger";

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
 * Checks if user has required role (exact match or higher in hierarchy)
 *
 * @param allowedRoles Array of allowed roles
 * @param handler Authenticated route handler
 * @returns Protected route handler with role check
 */
export function withRole(
  allowedRoles: string[] | Role[],
  handler: AuthenticatedHandler
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    const userRole = user.role as Role;

    console.log(
      "[withRole] User role from token:",
      userRole,
      "(type:",
      typeof userRole,
      ")"
    );
    console.log("[withRole] Allowed roles:", allowedRoles);
    console.log("[withRole] Checking each allowed role...");

    const hasRole = allowedRoles.some((role) => {
      console.log("  - Checking:", role, "vs user role:", userRole);
      const meets = meetsRoleRequirement(userRole, role as Role);
      console.log("    Result:", meets);
      return meets;
    });

    console.log("[withRole] Final result - hasRole:", hasRole);

    // Log the role check
    auditLogger.logRoleCheck(
      String(user.id),
      user.email,
      userRole,
      allowedRoles[0] as Role,
      hasRole ? AuditResult.ALLOWED : AuditResult.DENIED,
      hasRole
        ? `User role '${userRole}' meets requirement`
        : `User role '${userRole}' does not meet requirement: ${allowedRoles.join(", ")}`,
      {
        endpoint: req.nextUrl.pathname,
        method: req.method,
      }
    );

    if (!hasRole) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient permissions. Required role: ${allowedRoles.join(" or ")}`,
          error: "FORBIDDEN",
          code: "ROLE_REQUIRED",
        },
        { status: 403 }
      );
    }

    return await handler(req, user);
  });
}

/**
 * Permission-based access control
 * Checks if user has required permission
 *
 * @param permission Required permission
 * @param handler Authenticated route handler
 * @returns Protected route handler with permission check
 */
export function withPermission(
  permission: Permission,
  handler: AuthenticatedHandler
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    const userRole = user.role as Role;

    if (!isValidRole(userRole)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid user role: ${userRole}`,
          error: "INVALID_ROLE",
        },
        { status: 403 }
      );
    }

    const allowed = hasPermission(userRole, permission);

    // Log the permission check
    auditLogger.logPermissionCheck(
      String(user.id),
      user.email,
      userRole,
      permission,
      allowed ? AuditResult.ALLOWED : AuditResult.DENIED,
      allowed
        ? `Role '${userRole}' has permission '${permission}'`
        : `Role '${userRole}' lacks permission '${permission}'`,
      {
        endpoint: req.nextUrl.pathname,
        method: req.method,
      }
    );

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Access denied. Required permission: ${permission}`,
          error: "FORBIDDEN",
          code: "PERMISSION_REQUIRED",
        },
        { status: 403 }
      );
    }

    return await handler(req, user);
  });
}

/**
 * Multiple permissions access control (requires ANY of the permissions)
 *
 * @param permissions Array of permissions (user needs at least one)
 * @param handler Authenticated route handler
 * @returns Protected route handler
 */
export function withAnyPermission(
  permissions: Permission[],
  handler: AuthenticatedHandler
) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    const userRole = user.role as Role;

    if (!isValidRole(userRole)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid user role: ${userRole}`,
          error: "INVALID_ROLE",
        },
        { status: 403 }
      );
    }

    const allowed = permissions.some((permission) =>
      hasPermission(userRole, permission)
    );

    // Log the permission check
    auditLogger.logPermissionCheck(
      String(user.id),
      user.email,
      userRole,
      permissions[0], // Log first permission as representative
      allowed ? AuditResult.ALLOWED : AuditResult.DENIED,
      allowed
        ? `Role '${userRole}' has at least one required permission`
        : `Role '${userRole}' lacks all required permissions: ${permissions.join(", ")}`,
      {
        endpoint: req.nextUrl.pathname,
        method: req.method,
        requiredPermissions: permissions,
      }
    );

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Access denied. Required permissions (any): ${permissions.join(", ")}`,
          error: "FORBIDDEN",
          code: "PERMISSION_REQUIRED",
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
