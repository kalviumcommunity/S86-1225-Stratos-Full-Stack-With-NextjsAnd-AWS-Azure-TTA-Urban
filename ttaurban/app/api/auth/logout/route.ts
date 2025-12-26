/**
 * POST /api/auth/logout
 * Logout user by clearing refresh token cookie
 *
 * Security Features:
 * - Clears HTTP-only refresh token cookie
 * - Client should discard access token from memory
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Create response
  const response = NextResponse.json({
    success: true,
    message: "Logout successful",
  });

  // Clear refresh token cookie
  response.cookies.delete("refreshToken");

  return response;
}
