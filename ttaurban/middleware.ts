import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://ttaurban.vercel.app", // Add your production domain
];

// Log what the middleware sees on startup
console.log(
  "🔧 MIDDLEWARE LOADED [v3-SECURE-HEADERS] - JWT_SECRET:",
  JWT_SECRET || "UNDEFINED"
);
console.log("🔧 MIDDLEWARE: Security headers + CORS enabled");

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // ========================================
  // CORS HEADERS
  // ========================================
  const origin = req.headers.get("origin");

  // In development, allow all localhost origins
  if (process.env.NODE_ENV === "development" && origin?.includes("localhost")) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // ========================================
  // SECURITY HEADERS (Enhanced)
  // ========================================

  // HSTS - Force HTTPS for 2 years (production only)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Prevent XSS attacks
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - Control browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Content Security Policy (CSP) - Enhanced
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https:;
    font-src 'self' data:;
    connect-src 'self' http://localhost:* https://api.sendgrid.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  // ========================================
  // CSRF PROTECTION - Check Origin header
  // ========================================
  const isStateMutatingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(
    req.method
  );

  if (isStateMutatingMethod) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    // Allow same-origin requests only
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

  // ========================================
  // AUTHENTICATION & AUTHORIZATION
  // ========================================

  // Public routes - allow access without authentication
  const publicRoutes = ["/", "/login", "/signup", "/contact"];
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/refresh",
    "/api/debug/env", // Debug endpoint
    "/api/test-bypass", // Test endpoint that bypasses middleware completely
  ];

  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname === route);

  // Add middleware debug header to debug endpoint
  if (pathname === "/api/debug/env") {
    const debugResponse = NextResponse.next();
    debugResponse.headers.set(
      "X-Middleware-JWT-Secret-Length",
      String(JWT_SECRET.length)
    );
    debugResponse.headers.set("X-Middleware-JWT-Secret-Value", JWT_SECRET);
    return debugResponse;
  }

  if (isPublicRoute || isPublicApiRoute) {
    return response;
  }

  // API routes - check Bearer token in Authorization header
  if (pathname.startsWith("/api/")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing", error: "MISSING_TOKEN" },
        { status: 401 }
      );
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET, {
        issuer: "ttaurban-api",
        audience: "ttaurban-client",
      });
      console.log(
        "✅ Middleware: Token verified successfully for",
        decoded.email,
        "- Role:",
        decoded.role
      );

      // Role-based access control for admin routes
      if (pathname.startsWith("/api/admin") && decoded.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Access denied", error: "FORBIDDEN" },
          { status: 403 }
        );
      }

      // Attach user info for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", String(decoded.id));
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      const authenticatedResponse = NextResponse.next({
        request: { headers: requestHeaders },
      });

      // Copy security headers to authenticated response
      response.headers.forEach((value, key) => {
        authenticatedResponse.headers.set(key, value);
      });

      return authenticatedResponse;
    } catch (error: any) {
      console.error(
        "❌ Middleware: Token verification failed -",
        error.message
      );
      console.error("Token:", token?.substring(0, 30) + "...");
      console.error("JWT_SECRET length:", JWT_SECRET.length);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
          error: "INVALID_TOKEN",
        },
        { status: 401 }
      );
    }
  }

  // Protected page routes - check JWT in cookies or redirect to login
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/complaints")
  ) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      jwt.verify(token, JWT_SECRET, {
        issuer: "ttaurban-api",
        audience: "ttaurban-client",
      });
      return response;
    } catch {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
