/**
 * Role-Based Access Control (RBAC) Configuration
 *
 * Defines roles, permissions, and the permission hierarchy for the application.
 * This centralized configuration ensures consistent access control across the app.
 */

export enum Role {
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
  USER = "user", // Default role for authenticated users
}

export enum Permission {
  // User management
  CREATE_USER = "create:user",
  READ_USER = "read:user",
  UPDATE_USER = "update:user",
  DELETE_USER = "delete:user",

  // Complaint management
  CREATE_COMPLAINT = "create:complaint",
  READ_COMPLAINT = "read:complaint",
  UPDATE_COMPLAINT = "update:complaint",
  DELETE_COMPLAINT = "delete:complaint",

  // Department management
  CREATE_DEPARTMENT = "create:department",
  READ_DEPARTMENT = "read:department",
  UPDATE_DEPARTMENT = "update:department",
  DELETE_DEPARTMENT = "delete:department",

  // File management
  CREATE_FILE = "create:file",
  READ_FILE = "read:file",
  UPDATE_FILE = "update:file",
  DELETE_FILE = "delete:file",

  // Admin operations
  MANAGE_ROLES = "manage:roles",
  VIEW_AUDIT_LOGS = "view:audit_logs",
  MANAGE_SETTINGS = "manage:settings",
}

/**
 * Role-to-Permission Mapping
 * Defines which permissions each role has access to.
 */
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Full access to all resources
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,

    Permission.CREATE_COMPLAINT,
    Permission.READ_COMPLAINT,
    Permission.UPDATE_COMPLAINT,
    Permission.DELETE_COMPLAINT,

    Permission.CREATE_DEPARTMENT,
    Permission.READ_DEPARTMENT,
    Permission.UPDATE_DEPARTMENT,
    Permission.DELETE_DEPARTMENT,

    Permission.CREATE_FILE,
    Permission.READ_FILE,
    Permission.UPDATE_FILE,
    Permission.DELETE_FILE,

    Permission.MANAGE_ROLES,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_SETTINGS,
  ],

  [Role.EDITOR]: [
    // Read and update access, limited creation
    Permission.READ_USER,
    Permission.UPDATE_USER,

    Permission.CREATE_COMPLAINT,
    Permission.READ_COMPLAINT,
    Permission.UPDATE_COMPLAINT,

    Permission.READ_DEPARTMENT,
    Permission.UPDATE_DEPARTMENT,

    Permission.CREATE_FILE,
    Permission.READ_FILE,
    Permission.UPDATE_FILE,
  ],

  [Role.VIEWER]: [
    // Read-only access
    Permission.READ_USER,
    Permission.READ_COMPLAINT,
    Permission.READ_DEPARTMENT,
    Permission.READ_FILE,
  ],

  [Role.USER]: [
    // Basic authenticated user permissions
    Permission.READ_USER, // Can read own profile
    Permission.UPDATE_USER, // Can update own profile
    Permission.CREATE_COMPLAINT, // Can create complaints
    Permission.READ_COMPLAINT, // Can read own complaints
    Permission.READ_DEPARTMENT, // Can view departments
    Permission.CREATE_FILE, // Can upload files
    Permission.READ_FILE, // Can view own files
  ],
};

/**
 * Role hierarchy - higher roles inherit permissions from lower roles
 * Number indicates hierarchy level (higher = more privileged)
 */
export const roleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 4,
  [Role.EDITOR]: 3,
  [Role.USER]: 2,
  [Role.VIEWER]: 1,
};

/**
 * Default role assigned to new users
 */
export const DEFAULT_ROLE = Role.USER;

/**
 * Role display names for UI
 */
export const roleDisplayNames: Record<Role, string> = {
  [Role.ADMIN]: "Administrator",
  [Role.EDITOR]: "Editor",
  [Role.VIEWER]: "Viewer",
  [Role.USER]: "User",
};

/**
 * Role descriptions for documentation
 */
export const roleDescriptions: Record<Role, string> = {
  [Role.ADMIN]:
    "Full system access with all permissions including user and role management",
  [Role.EDITOR]:
    "Can create and modify content, but cannot delete or manage users",
  [Role.VIEWER]: "Read-only access to all resources",
  [Role.USER]: "Standard authenticated user with basic permissions",
};

/**
 * Validate if a string is a valid role
 *
 * @param role - Role string to validate
 * @returns true if valid role, false otherwise
 */
export function isValidRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}
