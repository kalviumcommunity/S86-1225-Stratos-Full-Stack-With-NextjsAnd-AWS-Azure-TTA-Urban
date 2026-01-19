// User Roles
export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  OFFICER: 'OFFICER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Complaint Status
export const COMPLAINT_STATUS = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
} as const;

export type ComplaintStatus = typeof COMPLAINT_STATUS[keyof typeof COMPLAINT_STATUS];

// Complaint Categories
export const COMPLAINT_CATEGORIES = [
  'Road & Infrastructure',
  'Water Supply',
  'Electricity',
  'Garbage Collection',
  'Street Lighting',
  'Drainage',
  'Public Property Damage',
  'Noise Pollution',
  'Air Pollution',
  'Other',
] as const;

export type ComplaintCategory = typeof COMPLAINT_CATEGORIES[number];

// SLA (Service Level Agreement) in hours
export const DEFAULT_SLA = {
  'Road & Infrastructure': 72,
  'Water Supply': 24,
  'Electricity': 12,
  'Garbage Collection': 48,
  'Street Lighting': 24,
  'Drainage': 48,
  'Public Property Damage': 72,
  'Noise Pollution': 24,
  'Air Pollution': 48,
  'Other': 72,
};

// Audit Actions
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ASSIGN: 'ASSIGN',
  STATUS_CHANGE: 'STATUS_CHANGE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// Notification Types
export const NOTIFICATION_TYPES = {
  COMPLAINT_CREATED: 'COMPLAINT_CREATED',
  COMPLAINT_ASSIGNED: 'COMPLAINT_ASSIGNED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  COMPLAINT_RESOLVED: 'COMPLAINT_RESOLVED',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
