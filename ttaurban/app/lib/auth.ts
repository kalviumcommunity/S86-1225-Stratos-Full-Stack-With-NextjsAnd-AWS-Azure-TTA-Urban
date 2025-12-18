import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name: string;
}

/**
 * Middleware to verify JWT token from request headers
 * Returns decoded user data if token is valid
 */
export function verifyToken(req: Request): AuthUser | null {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return null;
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.split(" ")[1];

    if (!token) {
      return null;
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Helper function to create unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}

/**
 * Helper function to create forbidden response
 */
export function forbiddenResponse(message: string = "Access forbidden") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 403 }
  );
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}
