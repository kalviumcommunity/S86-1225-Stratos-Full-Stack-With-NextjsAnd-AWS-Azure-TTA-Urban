import { z } from "zod";

/**
 * Zod Schema for Department Creation (POST)
 * Validates incoming data for creating a new department
 */
export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(3, "Department name must be at least 3 characters long")
    .max(100, "Department name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),
});

/**
 * Zod Schema for Department Update (PUT)
 * Validates incoming data for full department updates
 */
export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(3, "Department name must be at least 3 characters long")
    .max(100, "Department name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),
});

/**
 * Zod Schema for Department Partial Update (PATCH)
 * All fields are optional for partial updates
 */
export const patchDepartmentSchema = z
  .object({
    name: z
      .string()
      .min(3, "Department name must be at least 3 characters long")
      .max(100, "Department name must not exceed 100 characters")
      .optional(),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional()
      .nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * TypeScript type inference from schemas
 * These can be used across client and server for type safety
 */
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type PatchDepartmentInput = z.infer<typeof patchDepartmentSchema>;
