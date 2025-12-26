/**
 * JWT Utility Functions
 * Handles token generation, verification, and refresh logic
 *
 * Security Features:
 * - Separate access and refresh tokens
 * - Short-lived access tokens (15 minutes)
 * - Long-lived refresh tokens (7 days)
 * - Token rotation on refresh
 */

import jwt from "jsonwebtoken";

// Get secrets from environment variables
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

// Token expiry durations
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

// Warning for development
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn(
    "⚠️  WARNING: JWT secrets not set in environment variables. Using defaults (NOT SECURE FOR PRODUCTION)"
  );
}

/**
 * User payload interface for JWT
 */
export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  name: string;
}

/**
 * Token pair interface
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate Access Token
 * Short-lived token for API requests (15 minutes)
 *
 * @param payload User data to encode in token
 * @returns JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: "ttaurban-api",
    audience: "ttaurban-client",
  });
}

/**
 * Generate Refresh Token
 * Long-lived token for obtaining new access tokens (7 days)
 *
 * @param payload User data to encode in token
 * @returns JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    { id: payload.id, email: payload.email }, // Only essential data
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: "ttaurban-api",
      audience: "ttaurban-client",
    }
  );
}

/**
 * Generate Token Pair
 * Creates both access and refresh tokens
 *
 * @param payload User data to encode
 * @returns Object containing both tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify Access Token
 * Validates and decodes access token
 *
 * @param token Access token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: "ttaurban-api",
      audience: "ttaurban-client",
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Access token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid access token:", error.message);
    }
    return null;
  }
}

/**
 * Verify Refresh Token
 * Validates and decodes refresh token
 *
 * @param token Refresh token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyRefreshToken(
  token: string
): Pick<JWTPayload, "id" | "email"> | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: "ttaurban-api",
      audience: "ttaurban-client",
    }) as Pick<JWTPayload, "id" | "email">;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Refresh token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid refresh token:", error.message);
    }
    return null;
  }
}

/**
 * Decode Token Without Verification
 * Useful for checking expiry before making requests
 *
 * @param token JWT token to decode
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Check if Token is Expired
 * Compares token expiry with current time
 *
 * @param token JWT token to check
 * @returns True if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Get Token Expiry Time
 * Returns the expiry timestamp from token
 *
 * @param token JWT token
 * @returns Expiry timestamp or null
 */
export function getTokenExpiry(token: string): number | null {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
}
