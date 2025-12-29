/**
 * Sanitization Middleware
 * Automatically sanitizes all incoming request data
 * Apply this to API routes for automatic OWASP compliance
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  sanitizeObject, 
  SanitizationLevel,
  logSecurityEvent 
} from "./sanitize";

type SanitizedHandler = (
  req: NextRequest,
  sanitizedData: any
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware to sanitize request body
 * Automatically sanitizes all string inputs in request body
 * 
 * @param handler - Route handler that receives sanitized data
 * @param level - Sanitization level (default: STRICT)
 * @returns Protected route handler with auto-sanitization
 * 
 * @example
 * ```typescript
 * export const POST = withSanitization(
 *   async (req, sanitizedData) => {
 *     // sanitizedData.comment is already sanitized
 *     await db.comment.create({ data: sanitizedData });
 *     return NextResponse.json({ success: true });
 *   },
 *   SanitizationLevel.BASIC
 * );
 * ```
 */
export function withSanitization(
  handler: SanitizedHandler,
  level: SanitizationLevel = SanitizationLevel.STRICT
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get request body
      const contentType = req.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        return await handler(req, null);
      }
      
      const rawBody = await req.json().catch(() => ({}));
      
      // Detect potential XSS attempts
      const bodyStr = JSON.stringify(rawBody);
      if (containsPotentialXSS(bodyStr)) {
        logSecurityEvent('XSS_ATTEMPT', {
          input: bodyStr,
          endpoint: req.nextUrl.pathname,
        });
      }
      
      // Sanitize the entire body
      const sanitizedData = sanitizeObject(rawBody, level);
      
      // Call handler with sanitized data
      return await handler(req, sanitizedData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Sanitization middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          error: "SANITIZATION_ERROR",
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Detect potential XSS patterns in input
 * Returns true if suspicious patterns are found
 */
function containsPotentialXSS(input: string): boolean {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Query parameter sanitization middleware
 * Sanitizes URL query parameters
 */
export function sanitizeQueryParams(url: URL): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    // Remove potential SQL injection patterns
    const cleaned = value
      .replace(/['";]/g, '') // Remove quotes and semicolons
      .replace(/--/g, '')     // Remove SQL comments
      .replace(/\/\*/g, '')   // Remove block comments
      .replace(/\*\//g, '');
    
    sanitized[key] = cleaned.trim();
  });
  
  return sanitized;
}

/**
 * Rate limiting helper to prevent brute force attacks
 * Track requests by IP or user ID
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

/**
 * Clean expired rate limit records
 * Call periodically to prevent memory leaks
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
