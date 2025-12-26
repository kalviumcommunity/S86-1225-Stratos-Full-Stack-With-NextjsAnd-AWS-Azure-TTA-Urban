/**
 * Security Middleware for Next.js
 * Adds security headers to prevent XSS, CSRF, and other attacks
 *
 * To use: Add this to middleware.ts in the root of your app directory
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers

  // Prevent XSS attacks
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (CSP)
  // Adjust this based on your needs
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self';
    frame-ancestors 'none';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // CSRF Protection - Check Origin header for state-changing requests
  const isStateMutatingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(
    request.method
  );

  if (isStateMutatingMethod) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // Allow same-origin requests
    if (origin && host && !origin.includes(host)) {
      console.warn(
        `CSRF attempt blocked: Origin ${origin} does not match host ${host}`
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid origin",
          error: "CSRF_PROTECTION",
        },
        { status: 403 }
      );
    }
  }

  return response;
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Apply to all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
