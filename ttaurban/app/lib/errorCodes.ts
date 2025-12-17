// lib/errorCodes.ts

/**
 * Centralized Error Codes Dictionary
 * Maintains consistency across all API error responses
 */

export const ERROR_CODES = {
  // Validation Errors (E001-E099)
  VALIDATION_ERROR: "E001",
  MISSING_REQUIRED_FIELDS: "E002",
  INVALID_EMAIL_FORMAT: "E003",
  INVALID_INPUT: "E004",
  INVALID_FIELD_LENGTH: "E005",

  // Resource Errors (E100-E199)
  NOT_FOUND: "E100",
  RESOURCE_NOT_FOUND: "E101",
  USER_NOT_FOUND: "E102",
  COMPLAINT_NOT_FOUND: "E103",
  DEPARTMENT_NOT_FOUND: "E104",

  // Conflict Errors (E200-E299)
  CONFLICT: "E200",
  EMAIL_ALREADY_EXISTS: "E201",
  RESOURCE_ALREADY_EXISTS: "E202",
  DEPARTMENT_NAME_EXISTS: "E203",

  // Authentication & Authorization Errors (E300-E399)
  UNAUTHORIZED: "E300",
  FORBIDDEN: "E301",
  INVALID_TOKEN: "E302",
  TOKEN_EXPIRED: "E303",

  // Database Errors (E400-E499)
  DATABASE_ERROR: "E400",
  DATABASE_CONNECTION_FAILED: "E401",
  DATABASE_QUERY_FAILED: "E402",

  // Server Errors (E500-E599)
  INTERNAL_ERROR: "E500",
  SERVER_ERROR: "E501",
  SERVICE_UNAVAILABLE: "E502",

  // Feature-specific Errors (E600+)
  USER_FETCH_ERROR: "E600",
  USER_CREATION_FAILED: "E601",
  USER_UPDATE_FAILED: "E602",
  USER_DELETE_FAILED: "E603",

  COMPLAINT_FETCH_ERROR: "E610",
  COMPLAINT_CREATION_FAILED: "E611",
  COMPLAINT_UPDATE_FAILED: "E612",
  COMPLAINT_DELETE_FAILED: "E613",

  DEPARTMENT_FETCH_ERROR: "E620",
  DEPARTMENT_CREATION_FAILED: "E621",
  DEPARTMENT_UPDATE_FAILED: "E622",
  DEPARTMENT_DELETE_FAILED: "E623",
};

/**
 * Get error code by name
 * @param errorName - The name of the error
 * @returns The error code
 */
export const getErrorCode = (errorName: keyof typeof ERROR_CODES): string => {
  return ERROR_CODES[errorName];
};
