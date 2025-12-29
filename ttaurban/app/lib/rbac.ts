/**
 * RBAC (Role-Based Access Control) Utilities
 *
 * Provides functions for checking permissions, validating roles,
 * and enforcing access control throughout the application.
 */

import {
  Role,
  Permission,
  rolePermissions,
  roleHierarchy,
} from "@/app/config/roles";

export interface RBACUser {
  id: string;
  role: Role;
  email?: string;
}

/**
 * Check if a role has a specific permission
 *
 * @param role - User's role
 * @param permission - Permission to check
 * @returns true if role has permission, false otherwise
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if a role has any of the specified permissions
 *
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if role has at least one permission, false otherwise
 */
export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 *
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if role has all permissions, false otherwise
 */
export function hasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a user can access a specific resource based on ownership
 *
 * @param user - Current user
 * @param resourceOwnerId - ID of the resource owner
 * @param requiredPermission - Permission required if not owner
 * @returns true if user can access, false otherwise
 */
export function canAccessResource(
  user: RBACUser,
  resourceOwnerId: string,
  requiredPermission: Permission
): boolean {
  // Owner can always access their own resources
  if (user.id === resourceOwnerId) {
    return true;
  }

  // Otherwise, check if user has the required permission
  return hasPermission(user.role, requiredPermission);
}

/**
 * Check if a role is equal to or higher than another role in hierarchy
 *
 * @param role - Role to check
 * @param minimumRole - Minimum required role
 * @returns true if role meets minimum requirement, false otherwise
 */
export function meetsRoleRequirement(role: Role, minimumRole: Role): boolean {
  return roleHierarchy[role] >= roleHierarchy[minimumRole];
}

/**
 * Get all permissions for a given role
 *
 * @param role - User's role
 * @returns Array of permissions
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Validate if a string is a valid role
 *
 * @param role - Role string to validate
 * @returns true if valid role, false otherwise
 */
export function isValidRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}

/**
 * Create RBAC error response
 *
 * @param message - Error message
 * @param details - Additional details
 * @returns Error object
 */
export function createRBACError(
  message: string,
  details?: Record<string, any>
) {
  return {
    error: "Access Denied",
    message,
    code: "RBAC_ERROR",
    details,
  };
}

/**
 * Permission check result with detailed information
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPermission?: Permission;
  userRole?: Role;
}

/**
 * Perform detailed permission check with reasoning
 *
 * @param user - User to check
 * @param permission - Permission to check
 * @returns Detailed check result
 */
export function checkPermission(
  user: RBACUser,
  permission: Permission
): PermissionCheckResult {
  const allowed = hasPermission(user.role, permission);

  return {
    allowed,
    reason: allowed
      ? `Role '${user.role}' has permission '${permission}'`
      : `Role '${user.role}' lacks permission '${permission}'`,
    requiredPermission: permission,
    userRole: user.role,
  };
}

/**
 * Check multiple permissions and return detailed results
 *
 * @param user - User to check
 * @param permissions - Permissions to check
 * @param requireAll - If true, user must have all permissions; if false, any permission is sufficient
 * @returns Detailed check result
 */
export function checkPermissions(
  user: RBACUser,
  permissions: Permission[],
  requireAll: boolean = false
): PermissionCheckResult {
  const checker = requireAll ? hasAllPermissions : hasAnyPermission;
  const allowed = checker(user.role, permissions);

  const userPermissions = getRolePermissions(user.role);
  const missingPermissions = permissions.filter(
    (p) => !userPermissions.includes(p)
  );

  return {
    allowed,
    reason: allowed
      ? `Role '${user.role}' has ${requireAll ? "all" : "at least one of the"} required permissions`
      : `Role '${user.role}' is missing permissions: ${missingPermissions.join(", ")}`,
    userRole: user.role,
  };
}

/**
 * Authorization decorator for resource-based access control
 * Checks both permission and resource ownership
 */
export class ResourceAuthorizer {
  constructor(private user: RBACUser) {}

  /**
   * Check if user can read a resource
   */
  canRead(
    resourceOwnerId: string,
    resourceType: "user" | "complaint" | "department" | "file"
  ): boolean {
    const permissionMap = {
      user: Permission.READ_USER,
      complaint: Permission.READ_COMPLAINT,
      department: Permission.READ_DEPARTMENT,
      file: Permission.READ_FILE,
    };

    return canAccessResource(
      this.user,
      resourceOwnerId,
      permissionMap[resourceType]
    );
  }

  /**
   * Check if user can update a resource
   */
  canUpdate(
    resourceOwnerId: string,
    resourceType: "user" | "complaint" | "department" | "file"
  ): boolean {
    const permissionMap = {
      user: Permission.UPDATE_USER,
      complaint: Permission.UPDATE_COMPLAINT,
      department: Permission.UPDATE_DEPARTMENT,
      file: Permission.UPDATE_FILE,
    };

    return canAccessResource(
      this.user,
      resourceOwnerId,
      permissionMap[resourceType]
    );
  }

  /**
   * Check if user can delete a resource
   */
  canDelete(
    resourceOwnerId: string,
    resourceType: "user" | "complaint" | "department" | "file"
  ): boolean {
    const permissionMap = {
      user: Permission.DELETE_USER,
      complaint: Permission.DELETE_COMPLAINT,
      department: Permission.DELETE_DEPARTMENT,
      file: Permission.DELETE_FILE,
    };

    return canAccessResource(
      this.user,
      resourceOwnerId,
      permissionMap[resourceType]
    );
  }
}
