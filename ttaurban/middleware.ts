import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes - allow access without authentication
  const publicRoutes = ["/", "/login", "/contact"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // API routes - check Bearer token in Authorization header
  if (pathname.startsWith("/api/")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 401 }
      );
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Role-based access control for admin routes
      if (pathname.startsWith("/api/admin") && decoded.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Access denied" },
          { status: 403 }
        );
      }

      // Attach user info for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", String(decoded.id));
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 403 }
      );
    }
  }

  // Protected page routes - check JWT in cookies
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
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/complaints/:path*",
    "/api/:path*",
  ],
};
