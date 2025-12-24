"use client";
import { useState } from "react";
import { mutate } from "swr";

interface AddUserProps {
  onSuccess?: () => void;
}

export default function AddUser({ onSuccess }: AddUserProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CITIZEN",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optimisticUpdate, setOptimisticUpdate] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Optimistic UI Update
      // Show the user immediately in the UI before the API responds
      setOptimisticUpdate(true);
      const tempUser = {
        id: Date.now(), // Temporary ID
        ...formData,
        createdAt: new Date().toISOString(),
      };

      // Update the cache optimistically (without revalidation)
      mutate(
        (key: string) =>
          typeof key === "string" && key.startsWith("/api/users"),
        async (data: any) => {
          if (data?.users) {
            return {
              ...data,
              users: [...data.users, tempUser],
              total: data.total + 1,
            };
          }
          return data;
        },
        false // Don't revalidate immediately
      );

      // Step 2: Actual API Call
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // eslint-disable-next-line no-console
        console.log("✅ User added successfully:", result.user);

        // Step 3: Revalidate to sync with server
        await mutate(
          (key: string) =>
            typeof key === "string" && key.startsWith("/api/users")
        );

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "CITIZEN",
          phone: "",
        });

        if (onSuccess) onSuccess();
      } else {
        setError(result.message || "Failed to add user");

        // Rollback optimistic update on failure
        await mutate(
          (key: string) =>
            typeof key === "string" && key.startsWith("/api/users")
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("❌ Error adding user:", err);
      setError("Network error. Please try again.");

      // Rollback optimistic update
      await mutate(
        (key: string) => typeof key === "string" && key.startsWith("/api/users")
      );
    } finally {
      setLoading(false);
      setOptimisticUpdate(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Add New User</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {optimisticUpdate && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700">
          ⚡ Optimistic update in progress...
        </div>
      )}

      <form onSubmit={addUser} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CITIZEN">Citizen</option>
              <option value="OFFICER">Officer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add User"
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
        <p className="font-semibold mb-1">💡 Optimistic UI in Action:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>User appears instantly in the list (optimistic update)</li>
          <li>API request processes in the background</li>
          <li>Data syncs automatically when server responds</li>
          <li>Rollback happens if the request fails</li>
        </ul>
      </div>
    </div>
  );
}
