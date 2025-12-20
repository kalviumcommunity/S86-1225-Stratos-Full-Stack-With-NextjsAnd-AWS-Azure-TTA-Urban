import { NextResponse } from "next/server";
import { verifyToken, unauthorizedResponse } from "../../../lib/auth";
import { handleError } from "../../../lib/errorHandler";

/**
 * GET /api/auth/me
 * Protected route - Returns current user info from JWT token
 *
 * Headers:
 * Authorization: Bearer <token>
 */
export async function GET(req: Request) {
  try {
    // Verify JWT token
    const user = verifyToken(req);

    if (!user) {
      return unauthorizedResponse("Token missing or invalid");
    }

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
}
