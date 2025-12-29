import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/app/lib/authMiddleware";
import { Role } from "@/app/config/roles";
import { JWTPayload } from "@/app/lib/jwt";

/**
 * Simple test endpoint to verify RBAC works
 */
export const GET = withRole(
  [Role.ADMIN],
  async (req: NextRequest, user: JWTPayload) => {
    return NextResponse.json({
      success: true,
      message: "RBAC test successful!",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  }
);
