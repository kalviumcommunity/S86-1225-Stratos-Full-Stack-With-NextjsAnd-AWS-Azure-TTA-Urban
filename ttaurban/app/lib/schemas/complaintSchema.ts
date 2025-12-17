import { z } from "zod";

/**
 * Zod Schema for Complaint Creation (POST)
 * Validates incoming data for creating a new complaint
 */
export const createComplaintSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description must not exceed 2000 characters"),
  category: z.enum(
    [
      "ROAD_MAINTENANCE",
      "WATER_SUPPLY",
      "ELECTRICITY",
      "GARBAGE_COLLECTION",
      "STREET_LIGHTS",
      "DRAINAGE",
      "PUBLIC_SAFETY",
      "OTHER",
    ],
    { message: "Invalid complaint category" }
  ),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, "Address must not exceed 500 characters")
    .optional()
    .nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  userId: z.number().int().positive().optional(), // Optional for testing, should come from auth
  departmentId: z.number().int().positive().optional().nullable(),
});

/**
 * Zod Schema for Complaint Update (PUT)
 * Validates incoming data for full complaint updates
 */
export const updateComplaintSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description must not exceed 2000 characters"),
  category: z.enum(
    [
      "ROAD_MAINTENANCE",
      "WATER_SUPPLY",
      "ELECTRICITY",
      "GARBAGE_COLLECTION",
      "STREET_LIGHTS",
      "DRAINAGE",
      "PUBLIC_SAFETY",
      "OTHER",
    ],
    { message: "Invalid complaint category" }
  ),
  status: z
    .enum([
      "SUBMITTED",
      "VERIFIED",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
      "REJECTED",
    ])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, "Address must not exceed 500 characters")
    .optional()
    .nullable(),
  departmentId: z.number().int().positive().optional().nullable(),
  assignedTo: z.number().int().positive().optional().nullable(),
});

/**
 * Zod Schema for Complaint Partial Update (PATCH)
 * All fields are optional for partial updates
 */
export const patchComplaintSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(200, "Title must not exceed 200 characters")
      .optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(2000, "Description must not exceed 2000 characters")
      .optional(),
    category: z
      .enum([
        "ROAD_MAINTENANCE",
        "WATER_SUPPLY",
        "ELECTRICITY",
        "GARBAGE_COLLECTION",
        "STREET_LIGHTS",
        "DRAINAGE",
        "PUBLIC_SAFETY",
        "OTHER",
      ])
      .optional(),
    status: z
      .enum([
        "SUBMITTED",
        "VERIFIED",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
        "REJECTED",
      ])
      .optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    latitude: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional()
      .nullable(),
    longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional()
      .nullable(),
    address: z
      .string()
      .max(500, "Address must not exceed 500 characters")
      .optional()
      .nullable(),
    departmentId: z.number().int().positive().optional().nullable(),
    assignedTo: z.number().int().positive().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * TypeScript type inference from schemas
 * These can be used across client and server for type safety
 */
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
export type PatchComplaintInput = z.infer<typeof patchComplaintSchema>;
