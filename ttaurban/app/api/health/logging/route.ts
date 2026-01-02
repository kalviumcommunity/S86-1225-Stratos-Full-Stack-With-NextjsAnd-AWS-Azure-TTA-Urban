import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/structuredLogger";

/**
 * Health Check with Logging Example
 *
 * GET /api/health/logging
 *
 * Demonstrates structured logging in API routes
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = logger.generateRequestId();

  // Log incoming request
  logger.logRequest(req, { requestId });

  try {
    // Simulate some processing
    const result = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "ttaurban-nextjs",
      requestId,
    };

    // Log successful response
    const duration = Date.now() - startTime;
    logger.logResponse(requestId, 200, duration, {
      endpoint: "/api/health/logging",
    });

    // Log performance metric
    logger.logMetric("api_response_time", duration, "ms", {
      requestId,
      endpoint: "/api/health/logging",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Log error with full context
    const duration = Date.now() - startTime;
    logger.error(
      "Health check failed",
      { requestId, duration },
      error as Error
    );

    return NextResponse.json(
      {
        error: "Internal Server Error",
        requestId,
      },
      { status: 500 }
    );
  }
}
