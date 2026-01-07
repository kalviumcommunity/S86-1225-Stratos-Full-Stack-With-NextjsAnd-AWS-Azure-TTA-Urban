import { NextRequest, NextResponse } from "next/server";
import swaggerSpec from "@/lib/swagger";

/**
 * Swagger JSON Endpoint
 * Returns the OpenAPI specification in JSON format
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(swaggerSpec, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
