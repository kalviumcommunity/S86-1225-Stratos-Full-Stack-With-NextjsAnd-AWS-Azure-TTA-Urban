// lib/responseHandler.ts
import { NextResponse } from "next/server";

/**
 * Global API Response Handler
 * Ensures all API endpoints return responses in a consistent, structured format
 */

/**
 * Send a successful response
 * @param data - The data to return
 * @param message - Success message (default: "Success")
 * @param status - HTTP status code (default: 200)
 */
export const sendSuccess = (data: any, message = "Success", status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send an error response
 * @param message - Error message (default: "Something went wrong")
 * @param code - Error code (default: "INTERNAL_ERROR")
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details (optional)
 */
export const sendError = (
  message = "Something went wrong",
  code = "INTERNAL_ERROR",
  status = 500,
  details?: any
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: { code, details },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send a paginated success response
 * @param data - The data array to return
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @param message - Success message (default: "Data fetched successfully")
 */
export const sendPaginatedSuccess = (
  data: any[],
  page: number,
  limit: number,
  total: number,
  message = "Data fetched successfully"
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
};
