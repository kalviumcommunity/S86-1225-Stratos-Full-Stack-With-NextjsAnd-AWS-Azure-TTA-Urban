/**
 * Input Sanitization & Validation Utilities
 * OWASP Compliance - Protection against XSS and Injection Attacks
 *
 * This module provides comprehensive sanitization and validation
 * for all user inputs to prevent security vulnerabilities.
 */

import sanitizeHtml from "sanitize-html";
import validator from "validator";

/**
 * Sanitization Levels
 */
export enum SanitizationLevel {
  STRICT = "strict", // No HTML allowed (plain text only)
  BASIC = "basic", // Basic formatting only (p, br, b, i, em, strong)
  MODERATE = "moderate", // Common safe tags (includes lists, links)
  PERMISSIVE = "permissive", // More HTML but still safe
}

/**
 * Sanitization configurations for different levels
 */
const sanitizationConfigs = {
  [SanitizationLevel.STRICT]: {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "recursiveEscape",
  },

  [SanitizationLevel.BASIC]: {
    allowedTags: ["p", "br", "b", "i", "em", "strong", "u"],
    allowedAttributes: {},
    disallowedTagsMode: "recursiveEscape",
  },

  [SanitizationLevel.MODERATE]: {
    allowedTags: [
      "p",
      "br",
      "b",
      "i",
      "em",
      "strong",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
    ],
    allowedAttributes: {
      a: ["href", "title", "target"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "recursiveEscape",
  },

  [SanitizationLevel.PERMISSIVE]: {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    disallowedTagsMode: "recursiveEscape",
  },
};

/**
 * Sanitize user input based on specified level
 *
 * @param input - The user input to sanitize
 * @param level - Sanitization level (default: STRICT)
 * @returns Sanitized string safe for storage/display
 *
 * @example
 * ```typescript
 * const clean = sanitizeInput("<script>alert('XSS')</script>Hello");
 * // Returns: "Hello"
 *
 * const withBasic = sanitizeInput("<b>Bold</b><script>bad</script>", SanitizationLevel.BASIC);
 * // Returns: "<b>Bold</b>"
 * ```
 */
export function sanitizeInput(
  input: string,
  level: SanitizationLevel = SanitizationLevel.STRICT
): string {
  if (typeof input !== "string") {
    return "";
  }

  const config = sanitizationConfigs[level];
  return sanitizeHtml(input.trim(), config);
}

/**
 * Sanitize an object's string properties
 * Recursively sanitizes all string values in an object
 *
 * @param obj - Object with properties to sanitize
 * @param level - Sanitization level
 * @returns Object with sanitized values
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  level: SanitizationLevel = SanitizationLevel.STRICT
): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key], level) as any;
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key], level);
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize email
 *
 * @param email - Email to validate and sanitize
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== "string") return null;

  const trimmed = email.trim().toLowerCase();

  if (!validator.isEmail(trimmed)) {
    return null;
  }

  return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
}

/**
 * Validate and sanitize URL
 *
 * @param url - URL to validate and sanitize
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== "string") return null;

  const trimmed = url.trim();

  if (
    !validator.isURL(trimmed, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    return null;
  }

  return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
}

/**
 * Sanitize phone number - remove all non-numeric characters
 *
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== "string") return "";

  // Remove all non-numeric characters except + at start
  let cleaned = phone.trim();
  if (cleaned.startsWith("+")) {
    cleaned = "+" + cleaned.substring(1).replace(/\D/g, "");
  } else {
    cleaned = cleaned.replace(/\D/g, "");
  }

  return cleaned;
}

/**
 * SQL Injection Prevention - Validate identifier names
 * Use this for table names, column names, etc. that come from user input
 * (Note: With Prisma, this is rarely needed, but good for raw queries)
 *
 * @param identifier - Database identifier to validate
 * @returns Valid identifier or null
 */
export function validateDbIdentifier(identifier: string): string | null {
  if (typeof identifier !== "string") return null;

  // Only allow alphanumeric and underscore
  const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  if (!pattern.test(identifier)) {
    return null;
  }

  return identifier;
}

/**
 * Prevent NoSQL injection for MongoDB-style queries
 * Sanitizes object properties that might be used in queries
 *
 * @param query - Query object to sanitize
 * @returns Sanitized query object
 */
export function sanitizeNoSqlQuery<T extends Record<string, any>>(query: T): T {
  const sanitized = { ...query };

  for (const key in sanitized) {
    // Remove $ operators that could be injection attempts
    if (key.startsWith("$")) {
      delete sanitized[key];
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      if (Array.isArray(sanitized[key])) {
        sanitized[key] = sanitized[key].map((item: any) =>
          typeof item === "object" ? sanitizeNoSqlQuery(item) : item
        );
      } else {
        sanitized[key] = sanitizeNoSqlQuery(sanitized[key]);
      }
    }
  }

  return sanitized;
}

/**
 * Content Security Policy (CSP) Header Generator
 * Generates CSP header value for response headers
 */
export function generateCSPHeader(): string {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Encode output for safe HTML rendering
 * Use this when you must display user content as HTML
 *
 * @param html - HTML string to encode
 * @param level - Sanitization level
 * @returns Safely encoded HTML
 */
export function encodeOutput(
  html: string,
  level: SanitizationLevel = SanitizationLevel.BASIC
): string {
  return sanitizeInput(html, level);
}

/**
 * Validate and sanitize file upload filename
 * Prevents path traversal attacks
 *
 * @param filename - Filename to sanitize
 * @returns Safe filename or null
 */
export function sanitizeFilename(filename: string): string | null {
  if (typeof filename !== "string") return null;

  // Remove path separators and null bytes
  let clean = filename.replace(/[/\\]/g, "").replace(/\0/g, "");

  // Remove leading dots to prevent hidden files
  clean = clean.replace(/^\.+/, "");

  // Validate filename pattern
  const pattern = /^[a-zA-Z0-9_\-. ]+$/;
  if (!pattern.test(clean)) {
    return null;
  }

  // Limit length
  if (clean.length > 255) {
    return null;
  }

  return clean;
}

/**
 * Comprehensive input validation and sanitization
 * Use this as the main entry point for all user inputs
 *
 * @param data - Data object to validate and sanitize
 * @param rules - Validation rules for each field
 * @returns Sanitized data and validation errors
 */
export interface ValidationRule {
  type: "string" | "email" | "url" | "phone" | "number" | "boolean";
  required?: boolean;
  sanitizationLevel?: SanitizationLevel;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data: T;
  errors: Record<string, string>;
}

export function validateAndSanitize<T extends Record<string, any>>(
  data: Partial<T>,
  rules: Record<keyof T, ValidationRule>
): ValidationResult<Partial<T>> {
  const sanitized: Partial<T> = {};
  const errors: Record<string, string> = {};

  for (const key in rules) {
    const rule = rules[key];
    const value = data[key];

    // Check required
    if (
      rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors[key as string] = `${String(key)} is required`;
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    // Type-specific validation and sanitization
    switch (rule.type) {
      case "string":
        if (typeof value !== "string") {
          errors[key as string] = `${String(key)} must be a string`;
          break;
        }

        let sanitizedStr = sanitizeInput(
          value,
          rule.sanitizationLevel || SanitizationLevel.STRICT
        );

        if (rule.maxLength && sanitizedStr.length > rule.maxLength) {
          errors[key as string] =
            `${String(key)} must be at most ${rule.maxLength} characters`;
          break;
        }

        if (rule.minLength && sanitizedStr.length < rule.minLength) {
          errors[key as string] =
            `${String(key)} must be at least ${rule.minLength} characters`;
          break;
        }

        if (rule.pattern && !rule.pattern.test(sanitizedStr)) {
          errors[key as string] = `${String(key)} format is invalid`;
          break;
        }

        sanitized[key] = sanitizedStr as any;
        break;

      case "email":
        const cleanEmail = sanitizeEmail(value as string);
        if (!cleanEmail) {
          errors[key as string] = `${String(key)} must be a valid email`;
        } else {
          sanitized[key] = cleanEmail as any;
        }
        break;

      case "url":
        const cleanUrl = sanitizeUrl(value as string);
        if (!cleanUrl) {
          errors[key as string] = `${String(key)} must be a valid URL`;
        } else {
          sanitized[key] = cleanUrl as any;
        }
        break;

      case "phone":
        sanitized[key] = sanitizePhone(value as string) as any;
        break;

      case "number":
        const num = Number(value);
        if (isNaN(num)) {
          errors[key as string] = `${String(key)} must be a number`;
        } else {
          sanitized[key] = num as any;
        }
        break;

      case "boolean":
        sanitized[key] = Boolean(value) as any;
        break;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    data: sanitized,
    errors,
  };
}

/**
 * Security audit logger for sanitization events
 * Logs when potentially malicious input is detected
 */
export function logSecurityEvent(
  eventType:
    | "XSS_ATTEMPT"
    | "SQL_INJECTION"
    | "PATH_TRAVERSAL"
    | "INVALID_INPUT",
  details: {
    input: string;
    field?: string;
    userId?: number | string;
    endpoint?: string;
  }
): void {
  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.warn(`
🚨 SECURITY EVENT [${eventType}] - ${timestamp}
Field: ${details.field || "N/A"}
User: ${details.userId || "Anonymous"}
Endpoint: ${details.endpoint || "N/A"}
Input: ${details.input.substring(0, 100)}${details.input.length > 100 ? "..." : ""}
  `);

  // In production, send to security monitoring service
  // Example: sendToSIEM({ eventType, ...details, timestamp });
}
