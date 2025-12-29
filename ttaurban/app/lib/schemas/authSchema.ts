import { z } from "zod";

/**
 * Zod Schema for User Signup
 * Validates incoming data for user registration
 */
export const signupSchema = z.object({
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
  role: z
    .enum(["ADMIN", "EDITOR", "VIEWER", "USER", "CITIZEN", "OFFICER"])
    .default("USER"),
});

/**
 * Zod Schema for User Login
 * Validates incoming data for authentication
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * TypeScript type inference from schemas
 */
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
