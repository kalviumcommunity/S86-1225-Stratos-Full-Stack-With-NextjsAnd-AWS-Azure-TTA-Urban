"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { useState } from "react";
import AddUser from "./AddUser";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [showAddUser, setShowAddUser] = useState(false);

  // Fetch users with SWR - automatic caching and revalidation
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `/api/users?page=${page}&limit=10`,
    fetcher,
    {
      revalidateOnFocus: true, // Refetch when tab regains focus
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Stop retrying after 3 attempts
        if (retryCount >= 3) return;

        // Retry after 2 seconds
        setTimeout(() => revalidate({ retryCount }), 2000);
      },
    }
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">Failed to load users</p>
          <p className="text-red-500 text-sm mt-1">
            {error.message || "An error occurred"}
          </p>
          <button
            onClick={() => mutate()}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User List</h1>
          <p className="text-gray-600 mt-1">
            Total: {data?.total || 0} users (Page {data?.page || 1} of{" "}
            {data?.totalPages || 1})
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showAddUser ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Add User Component */}
      {showAddUser && (
        <div className="mb-6">
          <AddUser
            onSuccess={() => {
              mutate(); // Revalidate the user list
              setShowAddUser(false);
            }}
          />
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/users/${user.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {page} of {data?.totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (data?.totalPages || 1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Next
        </button>
      </div>

      {/* SWR Cache Info (for debugging) */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          SWR Cache Information
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Data cached for instant loading on revisit</li>
          <li>✅ Auto-revalidates on tab focus</li>
          <li>✅ Auto-refresh every 30 seconds</li>
          <li>✅ Optimistic updates enabled</li>
        </ul>
      </div>
    </main>
  );
}
