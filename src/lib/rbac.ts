import { UserRole, USER_ROLES } from '@/utils/constants';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Check if user has required role
 */
export function hasRole(user: SessionUser | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

/**
 * Check if user has one of the required roles
 */
export function hasAnyRole(user: SessionUser | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, USER_ROLES.ADMIN);
}

/**
 * Check if user is officer
 */
export function isOfficer(user: SessionUser | null): boolean {
  return hasRole(user, USER_ROLES.OFFICER);
}

/**
 * Check if user is citizen
 */
export function isCitizen(user: SessionUser | null): boolean {
  return hasRole(user, USER_ROLES.CITIZEN);
}

/**
 * Check if user is admin or officer
 */
export function isStaff(user: SessionUser | null): boolean {
  return hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.OFFICER]);
}

/**
 * Get redirect URL based on user role
 */
export function getRoleRedirectUrl(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return '/admin/dashboard';
    case USER_ROLES.OFFICER:
      return '/officer/dashboard';
    case USER_ROLES.CITIZEN:
    default:
      return '/complaints';
  }
}
