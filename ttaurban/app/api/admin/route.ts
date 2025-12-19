import { NextRequest, NextResponse } from "next/server";

/**
 * Admin-only route - demonstrates role-based access control
 * Only users with ADMIN role can access this endpoint
 * The middleware validates the JWT and checks the role before this handler runs
 */

export async function GET(req: NextRequest) {
  // User info is attached by middleware
  const userEmail = req.headers.get("x-user-email");
  const userRole = req.headers.get("x-user-role");

  return NextResponse.json({
    success: true,
    message: "Welcome Admin! You have full access.",
    user: {
      email: userEmail,
      role: userRole,
    },
  });
}

export async function POST(req: NextRequest) {
  const userEmail = req.headers.get("x-user-email");
  const userRole = req.headers.get("x-user-role");
  const body = await req.json();

  return NextResponse.json({
    success: true,
    message: "Admin action completed successfully",
    user: {
      email: userEmail,
      role: userRole,
    },
    data: body,
  });
}
