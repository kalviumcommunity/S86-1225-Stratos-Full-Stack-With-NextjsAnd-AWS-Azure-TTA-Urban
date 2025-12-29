/**
 * Role-Based UI Component
 * Conditionally renders UI elements based on user permissions and roles
 */

"use client";

import { useAuthContext } from "@/context/AuthContext";
import { Role, Permission, rolePermissions } from "@/app/config/roles";

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: Role[];
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard Component
 * Shows children only if user has required role or permission
 *
 * @example
 * <RoleGuard roles={[Role.ADMIN]}>
 *   <button>Delete User</button>
 * </RoleGuard>
 *
 * @example
 * <RoleGuard permissions={[Permission.DELETE_USER]}>
 *   <button>Delete</button>
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  roles,
  permissions,
  requireAll = false,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuthContext();

  if (!user) {
    return <>{fallback}</>;
  }

  const userRole = user.role as Role;

  // Check role requirement
  if (roles && roles.length > 0) {
    const hasRole = roles.includes(userRole);
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  // Check permission requirement
  if (permissions && permissions.length > 0) {
    const userPermissions = rolePermissions[userRole] || [];

    const hasPermission = requireAll
      ? permissions.every((p) => userPermissions.includes(p))
      : permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Hook to check user permissions
 */
export function usePermission() {
  const { user } = useAuthContext();

  const hasRole = (role: Role): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const userRole = user.role as Role;
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    const userRole = user.role as Role;
    const userPermissions = rolePermissions[userRole] || [];
    return permissions.some((p) => userPermissions.includes(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    const userRole = user.role as Role;
    const userPermissions = rolePermissions[userRole] || [];
    return permissions.every((p) => userPermissions.includes(p));
  };

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole: user?.role as Role | undefined,
  };
}

/**
 * AdminOnly Component
 * Shortcut for admin-only content
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard roles={[Role.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * EditorOrAdmin Component
 * Shortcut for editor or admin content
 */
export function EditorOrAdmin({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard roles={[Role.ADMIN, Role.EDITOR]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
