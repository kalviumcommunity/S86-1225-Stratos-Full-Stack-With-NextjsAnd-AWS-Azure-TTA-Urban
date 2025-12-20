import { NextResponse } from "next/server";
import { logger } from "./logger";
import { ZodError } from "zod";

/**
 * Centralized Error Handler
 * Provides consistent error responses across all API routes
 * - Development: Shows detailed error messages and stack traces
 * - Production: Hides sensitive information, logs internally
 */

export function handleError(error: any, context: string) {
  const isProd = process.env.NODE_ENV === "production";

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    logger.error(`Validation error in ${context}`, {
      issues: error.issues,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Validation Error",
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Build error response based on environment
  const errorResponse = {
    success: false,
    message: isProd
      ? "Something went wrong. Please try again later."
      : error.message || "Unknown error",
    ...(isProd ? {} : { stack: error.stack }),
  };

  // Log error with full details
  logger.error(`Error in ${context}`, {
    message: error.message,
    stack: isProd ? "REDACTED" : error.stack,
    name: error.name,
  });

  // Determine status code
  const statusCode = error.statusCode || error.status || 500;

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Custom Error Classes for specific error types
 */

export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string = "Resource already exists") {
    super(message);
    this.name = "ConflictError";
  }
}

export class DatabaseError extends Error {
  statusCode = 500;
  constructor(message: string = "Database operation failed") {
    super(message);
    this.name = "DatabaseError";
  }
}
