/**
 * CORS Configuration for API Routes
 * Cross-Origin Resource Sharing security settings
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Allowed origins for CORS
 * In production, replace with your actual frontend domains
 */
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://ttaurban.vercel.app", // Example production domain
  // Add your production domains here
];

/**
 * Allowed HTTP methods
 */
const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

/**
 * Allowed headers
 */
const ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "Accept",
  "Origin",
];

/**
 * Apply CORS headers to response
 *
 * @param req - Next.js request object
 * @param res - Next.js response object
 * @returns Response with CORS headers
 */
export function applyCorsHeaders(
  req: NextRequest,
  res: NextResponse
): NextResponse {
  const origin = req.headers.get("origin");

  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "development") {
    // Allow all origins in development
    res.headers.set("Access-Control-Allow-Origin", "*");
  }

  res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS.join(", "));
  res.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS.join(", "));
  res.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  res.headers.set("Access-Control-Allow-Credentials", "true");

  return res;
}

/**
 * CORS Middleware wrapper for API routes
 *
 * @param handler - API route handler function
 * @returns Wrapped handler with CORS support
 */
export function withCors(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      return applyCorsHeaders(req, response);
    }

    // Handle actual request
    const response = await handler(req);
    return applyCorsHeaders(req, response);
  };
}

/**
 * Validate origin against allowed list
 *
 * @param origin - Origin to validate
 * @returns True if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get CORS error response
 *
 * @param message - Error message
 * @returns NextResponse with error
 */
export function corsError(message = "CORS policy violation"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "FORBIDDEN",
      message,
    },
    { status: 403 }
  );
}
