import { NextResponse, NextRequest } from "next/server";
import { logger } from "@/lib/structuredLogger";

/**
 * Health Check Endpoint
 * Returns basic health status of the application
 * Used by Docker, ECS, and Azure App Service for container health monitoring
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = logger.generateRequestId();

  // Log health check request
  logger.logRequest(req, { requestId, endpoint: "/api/health" });

  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "ttaurban-app",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      requestId,
    };

    // Log successful health check
    const duration = Date.now() - startTime;
    logger.logResponse(requestId, 200, duration);

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log health check failure
    logger.error(
      "Health check failed",
      { requestId, duration, endpoint: "/api/health" },
      error as Error
    );

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      },
      { status: 503 }
    );
  }
}
