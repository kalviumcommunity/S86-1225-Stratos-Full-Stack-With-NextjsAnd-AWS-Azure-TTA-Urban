/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from HTTP-only cookie
 *
 * Security Features:
 * - Validates refresh token from secure cookie
 * - Issues new access token
 * - Rotates refresh token for enhanced security
 * - Protects against token replay attacks
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateTokenPair } from "../../../lib/jwt";
import { prisma } from "../../../lib/prisma";
import { handleError } from "../../../lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    // Extract refresh token from HTTP-only cookie
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token not found. Please login again.",
          error: "MISSING_REFRESH_TOKEN",
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      // Clear invalid refresh token
      const response = NextResponse.json(
        {
          success: false,
          message: "Invalid or expired refresh token. Please login again.",
          error: "INVALID_REFRESH_TOKEN",
        },
        { status: 401 }
      );

      response.cookies.delete("refreshToken");
      return response;
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          message: "User not found. Please login again.",
          error: "USER_NOT_FOUND",
        },
        { status: 404 }
      );

      response.cookies.delete("refreshToken");
      return response;
    }

    // Generate new token pair (token rotation)
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Create response with new access token
    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Rotate refresh token (set new one)
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/refresh");
  }
}
