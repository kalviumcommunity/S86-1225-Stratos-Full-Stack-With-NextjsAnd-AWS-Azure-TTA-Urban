/**
 * Security Headers Utilities
 * Comprehensive security header management for Next.js
 */

import { NextResponse } from "next/server";

/**
 * Security header configurations
 */
export const SECURITY_HEADERS = {
  // HSTS - Force HTTPS for 2 years
  STRICT_TRANSPORT_SECURITY: "max-age=63072000; includeSubDomains; preload",

  // CSP - Content Security Policy
  CONTENT_SECURITY_POLICY: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' http://localhost:* https://api.sendgrid.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),

  // Prevent clickjacking
  X_FRAME_OPTIONS: "DENY",

  // Prevent MIME sniffing
  X_CONTENT_TYPE_OPTIONS: "nosniff",

  // Referrer policy
  REFERRER_POLICY: "strict-origin-when-cross-origin",

  // XSS Protection (legacy but still useful)
  X_XSS_PROTECTION: "1; mode=block",

  // Control browser features
  PERMISSIONS_POLICY: "camera=(), microphone=(), geolocation=()",
};

/**
 * Apply all security headers to a response
 *
 * @param response - NextResponse object
 * @returns Response with security headers
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Strict-Transport-Security",
    SECURITY_HEADERS.STRICT_TRANSPORT_SECURITY
  );
  response.headers.set(
    "Content-Security-Policy",
    SECURITY_HEADERS.CONTENT_SECURITY_POLICY
  );
  response.headers.set("X-Frame-Options", SECURITY_HEADERS.X_FRAME_OPTIONS);
  response.headers.set(
    "X-Content-Type-Options",
    SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS
  );
  response.headers.set("Referrer-Policy", SECURITY_HEADERS.REFERRER_POLICY);
  response.headers.set("X-XSS-Protection", SECURITY_HEADERS.X_XSS_PROTECTION);
  response.headers.set(
    "Permissions-Policy",
    SECURITY_HEADERS.PERMISSIONS_POLICY
  );

  return response;
}

/**
 * Create a CSP nonce for inline scripts
 * Use this when you need to allow specific inline scripts
 *
 * @returns Random nonce string
 */
export function generateCSPNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString(
    "base64"
  );
}

/**
 * Get security headers as object (for API routes)
 *
 * @returns Object with security headers
 */
export function getSecurityHeadersObject(): Record<string, string> {
  return {
    "Strict-Transport-Security": SECURITY_HEADERS.STRICT_TRANSPORT_SECURITY,
    "Content-Security-Policy": SECURITY_HEADERS.CONTENT_SECURITY_POLICY,
    "X-Frame-Options": SECURITY_HEADERS.X_FRAME_OPTIONS,
    "X-Content-Type-Options": SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS,
    "Referrer-Policy": SECURITY_HEADERS.REFERRER_POLICY,
    "X-XSS-Protection": SECURITY_HEADERS.X_XSS_PROTECTION,
    "Permissions-Policy": SECURITY_HEADERS.PERMISSIONS_POLICY,
  };
}

/**
 * Validate if request is using HTTPS
 *
 * @param protocol - Request protocol
 * @param host - Request host
 * @returns True if HTTPS or localhost
 */
export function isSecureConnection(
  protocol: string | null,
  host: string | null
): boolean {
  // Allow localhost in development
  if (process.env.NODE_ENV === "development" && host?.includes("localhost")) {
    return true;
  }

  return protocol === "https:";
}

/**
 * Security headers information for documentation
 */
export const SECURITY_HEADERS_INFO = {
  HSTS: {
    name: "HTTP Strict Transport Security",
    purpose: "Forces browsers to always use HTTPS",
    prevents: "Man-in-the-middle (MITM) attacks, protocol downgrade attacks",
    value: SECURITY_HEADERS.STRICT_TRANSPORT_SECURITY,
  },
  CSP: {
    name: "Content Security Policy",
    purpose: "Restricts allowed sources for scripts, styles, and content",
    prevents: "Cross-Site Scripting (XSS), data injection attacks",
    value: SECURITY_HEADERS.CONTENT_SECURITY_POLICY,
  },
  "X-Frame-Options": {
    name: "X-Frame-Options",
    purpose: "Prevents page from being embedded in frames/iframes",
    prevents: "Clickjacking attacks",
    value: SECURITY_HEADERS.X_FRAME_OPTIONS,
  },
  "X-Content-Type-Options": {
    name: "X-Content-Type-Options",
    purpose: "Prevents MIME type sniffing",
    prevents: "MIME confusion attacks",
    value: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS,
  },
  "Referrer-Policy": {
    name: "Referrer Policy",
    purpose: "Controls how much referrer information is shared",
    prevents: "Information leakage",
    value: SECURITY_HEADERS.REFERRER_POLICY,
  },
  "X-XSS-Protection": {
    name: "X-XSS-Protection",
    purpose: "Enables browser's XSS filter",
    prevents: "Reflected XSS attacks (legacy)",
    value: SECURITY_HEADERS.X_XSS_PROTECTION,
  },
  "Permissions-Policy": {
    name: "Permissions Policy",
    purpose: "Controls which browser features can be used",
    prevents: "Unauthorized access to device features",
    value: SECURITY_HEADERS.PERMISSIONS_POLICY,
  },
};
