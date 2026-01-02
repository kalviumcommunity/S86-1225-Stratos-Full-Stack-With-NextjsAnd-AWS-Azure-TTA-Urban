import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * Returns basic health status of the application
 * Used by Docker, ECS, and Azure App Service for container health monitoring
 */
export async function GET() {
  try {
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "ttaurban-app",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
