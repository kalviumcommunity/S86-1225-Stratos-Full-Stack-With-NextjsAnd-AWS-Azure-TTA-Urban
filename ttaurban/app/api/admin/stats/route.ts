/**
 * Admin-Only API Route
 * Demonstrates role-based protection
 * Only ADMIN users can access this endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/app/lib/authMiddleware";
import { Role } from "@/app/config/roles";
import { JWTPayload } from "@/app/lib/jwt";
import { auditLogger } from "@/app/lib/auditLogger";

/**
 * GET /api/admin/stats
 * Retrieve admin statistics
 *
 * @requires Role: ADMIN
 */
export const GET = withRole(
  [Role.ADMIN],
  async (req: NextRequest, user: JWTPayload) => {
    try {
      // Get audit statistics
      const stats = auditLogger.getStatistics();
      const deniedAttempts = auditLogger.getDeniedAttempts();

      return NextResponse.json({
        success: true,
        message: "Admin statistics retrieved successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          audit: {
            ...stats,
            recentDeniedAttempts: deniedAttempts.slice(-10).map((log) => ({
              timestamp: log.timestamp,
              userId: log.userId,
              userEmail: log.userEmail,
              action: log.action,
              resource: log.resource || log.permission,
              reason: log.reason,
            })),
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch admin statistics",
          error: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/admin/clear-logs
 * Clear audit logs
 *
 * @requires Role: ADMIN
 */
export const POST = withRole(
  [Role.ADMIN],
  async (req: NextRequest, user: JWTPayload) => {
    try {
      const beforeCount = auditLogger.getStatistics().total;
      auditLogger.clearLogs();

      return NextResponse.json({
        success: true,
        message: "Audit logs cleared successfully",
        data: {
          clearedLogs: beforeCount,
          clearedBy: user.email,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error clearing logs:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to clear audit logs",
          error: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }
  }
);
