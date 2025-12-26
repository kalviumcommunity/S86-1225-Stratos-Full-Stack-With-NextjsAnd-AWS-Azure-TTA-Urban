import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // ========================================
  // SECURITY HEADERS (XSS, CSRF, Clickjacking Protection)
  // ========================================

  // Prevent XSS attacks
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (CSP)
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

  // Strict Transport Security (HTTPS only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

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
  ];

  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname === route);

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
      const decoded: any = jwt.verify(token, JWT_SECRET);

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
    } catch {
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
      jwt.verify(token, JWT_SECRET);
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
