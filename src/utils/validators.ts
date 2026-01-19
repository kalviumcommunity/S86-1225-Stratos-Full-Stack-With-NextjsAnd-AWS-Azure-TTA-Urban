import { z } from 'zod';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS, USER_ROLES } from './constants';

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  role: z.enum([USER_ROLES.CITIZEN, USER_ROLES.OFFICER, USER_ROLES.ADMIN]),
  address: z.string().optional(),
  department: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Complaint validation schemas
export const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.enum(COMPLAINT_CATEGORIES as unknown as [string, ...string[]]),
  images: z.array(z.string()).max(5, 'Maximum 5 images allowed').optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(5, 'Address is required'),
  }),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum([
    COMPLAINT_STATUS.NEW,
    COMPLAINT_STATUS.ASSIGNED,
    COMPLAINT_STATUS.IN_PROGRESS,
    COMPLAINT_STATUS.RESOLVED,
    COMPLAINT_STATUS.CLOSED,
    COMPLAINT_STATUS.REJECTED,
  ] as [string, ...string[]]),
  notes: z.string().optional(),
  resolutionProof: z.array(z.string()).optional(),
});

export const assignComplaintSchema = z.object({
  officerId: z.string().min(1, 'Officer ID is required'),
  notes: z.string().optional(),
});

// SLA validation
export const updateSLASchema = z.object({
  category: z.enum(COMPLAINT_CATEGORIES as unknown as [string, ...string[]]),
  hours: z.number().min(1).max(720), // 1 hour to 30 days
});

// Type inference
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
export type UpdateSLAInput = z.infer<typeof updateSLASchema>;
