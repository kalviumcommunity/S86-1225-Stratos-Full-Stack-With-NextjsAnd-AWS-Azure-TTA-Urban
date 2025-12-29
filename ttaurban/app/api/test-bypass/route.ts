/**
 * Test endpoint that bypasses middleware to test withRole directly
 */
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/app/lib/authMiddleware";
import { Role } from "@/app/config/roles";
import { JWTPayload } from "@/app/lib/jwt";

export const GET = withRole(
  [Role.ADMIN],
  async (req: NextRequest, user: JWTPayload) => {
    return NextResponse.json({
      success: true,
      message: "Direct route handler test - RBAC working!",
      middleware: "BYPASSED",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  }
);
