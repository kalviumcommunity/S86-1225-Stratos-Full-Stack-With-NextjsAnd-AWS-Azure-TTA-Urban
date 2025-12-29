import { NextResponse } from "next/server";

// Public endpoint for debugging (REMOVE IN PRODUCTION)
export async function GET() {
  // This shows what the API route sees
  const apiJwtSecret = process.env.JWT_SECRET;

  return NextResponse.json({
    message: "API Route Environment",
    JWT_SECRET_SET: !!apiJwtSecret,
    JWT_SECRET_VALUE: apiJwtSecret || "NOT_SET",
    JWT_SECRET_LENGTH: apiJwtSecret?.length || 0,
    JWT_REFRESH_SECRET_SET: !!process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_VALUE: process.env.JWT_REFRESH_SECRET || "NOT_SET",
    NODE_ENV: process.env.NODE_ENV,
  });
}

export const dynamic = "force-dynamic";
