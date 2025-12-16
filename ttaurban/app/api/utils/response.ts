import { NextResponse } from 'next/server';

/**
 * Utility functions for consistent API responses
 */

export const ApiResponse = {
  success: (data: unknown, status = 200) => {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    );
  },

  created: (data: unknown) => {
    return NextResponse.json(
      {
        success: true,
        message: 'Resource created successfully',
        data,
      },
      { status: 201 }
    );
  },

  paginated: (data: unknown, page: number, limit: number, total: number) => {
    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  },

  error: (message: string, status = 500) => {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  },

  badRequest: (message: string) => {
    return ApiResponse.error(message, 400);
  },

  notFound: (message = 'Resource not found') => {
    return ApiResponse.error(message, 404);
  },

  unauthorized: (message = 'Unauthorized access') => {
    return ApiResponse.error(message, 401);
  },

  forbidden: (message = 'Forbidden') => {
    return ApiResponse.error(message, 403);
  },

  conflict: (message: string) => {
    return ApiResponse.error(message, 409);
  },

  serverError: (message = 'Internal server error') => {
    return ApiResponse.error(message, 500);
  },
};
