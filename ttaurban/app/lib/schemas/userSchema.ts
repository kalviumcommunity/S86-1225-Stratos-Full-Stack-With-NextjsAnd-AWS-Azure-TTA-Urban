import { z } from "zod";

/**
 * Zod Schema for User Creation (POST)
 * Validates incoming data for creating a new user
 */
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  role: z.enum(["CITIZEN", "OFFICER", "ADMIN"]).default("CITIZEN"),
});

/**
 * Zod Schema for User Update (PUT)
 * Validates incoming data for full user updates
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  role: z.enum(["CITIZEN", "OFFICER", "ADMIN"]).optional(),
});

/**
 * Zod Schema for User Partial Update (PATCH)
 * All fields are optional for partial updates
 */
export const patchUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must not exceed 100 characters")
      .optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional()
      .nullable(),
    role: z.enum(["CITIZEN", "OFFICER", "ADMIN"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * TypeScript type inference from schemas
 * These can be used across client and server for type safety
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PatchUserInput = z.infer<typeof patchUserSchema>;
