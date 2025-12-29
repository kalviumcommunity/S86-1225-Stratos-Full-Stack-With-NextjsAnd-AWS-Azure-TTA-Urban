/**
 * RBAC Demo Component
 * Demonstrates role-based access control in the UI
 */

"use client";

import {
  RoleGuard,
  AdminOnly,
  EditorOrAdmin,
  usePermission,
} from "@/components/RoleGuard";
import { Role, Permission, roleDisplayNames } from "@/app/config/roles";
import { useAuthContext } from "@/context/AuthContext";

export default function RBACDemo() {
  const { user } = useAuthContext();
  const { hasPermission, hasRole, userRole } = usePermission();

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
        <p>Please log in to see role-based content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">
          Role-Based Access Control Demo
        </h1>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="font-semibold">Current User:</p>
          <p>Email: {user.email}</p>
          <p>Role: {roleDisplayNames[userRole as Role] || user.role}</p>
        </div>

        {/* Admin Only Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Admin Only Section</h2>
          <AdminOnly
            fallback={
              <p className="text-gray-500 italic">
                Access Denied - Admin role required
              </p>
            }
          >
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✓ Access Granted
              </p>
              <p>You can see this because you are an admin.</p>
              <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Delete All Users
              </button>
            </div>
          </AdminOnly>
        </div>

        {/* Editor or Admin Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Editor or Admin Section
          </h2>
          <EditorOrAdmin
            fallback={
              <p className="text-gray-500 italic">
                Access Denied - Editor or Admin role required
              </p>
            }
          >
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200">
              <p className="text-blue-800 dark:text-blue-200 font-semibold">
                ✓ Access Granted
              </p>
              <p>You can see this because you are an editor or admin.</p>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Edit Content
              </button>
            </div>
          </EditorOrAdmin>
        </div>

        {/* Permission-Based Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Permission-Based Rendering
          </h2>

          <div className="space-y-3">
            {/* Create User Permission */}
            <RoleGuard
              permissions={[Permission.CREATE_USER]}
              fallback={
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-gray-600 dark:text-gray-300">
                    ✗ Cannot create users
                  </p>
                </div>
              }
            >
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
                <p className="text-green-800 dark:text-green-200">
                  ✓ Can create users
                </p>
                <button className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  Create User
                </button>
              </div>
            </RoleGuard>

            {/* Delete User Permission */}
            <RoleGuard
              permissions={[Permission.DELETE_USER]}
              fallback={
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-gray-600 dark:text-gray-300">
                    ✗ Cannot delete users
                  </p>
                </div>
              }
            >
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200">
                <p className="text-red-800 dark:text-red-200">
                  ✓ Can delete users
                </p>
                <button className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                  Delete User
                </button>
              </div>
            </RoleGuard>

            {/* Update Complaint Permission */}
            <RoleGuard
              permissions={[Permission.UPDATE_COMPLAINT]}
              fallback={
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-gray-600 dark:text-gray-300">
                    ✗ Cannot update complaints
                  </p>
                </div>
              }
            >
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ✓ Can update complaints
                </p>
                <button className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
                  Update Complaint
                </button>
              </div>
            </RoleGuard>
          </div>
        </div>

        {/* Programmatic Permission Checks */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Programmatic Permission Checks
          </h2>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded border">
            <ul className="space-y-2">
              <li>
                <strong>Can create users:</strong>{" "}
                {hasPermission(Permission.CREATE_USER) ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Yes
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ No</span>
                )}
              </li>
              <li>
                <strong>Can delete users:</strong>{" "}
                {hasPermission(Permission.DELETE_USER) ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Yes
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ No</span>
                )}
              </li>
              <li>
                <strong>Can manage roles:</strong>{" "}
                {hasPermission(Permission.MANAGE_ROLES) ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Yes
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ No</span>
                )}
              </li>
              <li>
                <strong>Is Admin:</strong>{" "}
                {hasRole(Role.ADMIN) ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Yes
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ No</span>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* All Users Can See This */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200">
          <h2 className="text-xl font-semibold mb-2">Public Content</h2>
          <p>
            All authenticated users can see this content, regardless of role.
          </p>
        </div>
      </div>
    </div>
  );
}
