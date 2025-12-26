import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "../../../lib/authMiddleware";
import { handleError } from "../../../lib/errorHandler";

/**
 * GET /api/auth/me
 * Protected route - Returns current user info from JWT token
 *
 * Headers:
 * Authorization: Bearer <access_token>
 */
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    return NextResponse.json({
      success: true,
      message: "User authenticated",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return handleError(error, "GET /api/auth/me");
  }
});
