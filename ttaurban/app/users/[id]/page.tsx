"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

interface Props {
  params: { id: string };
}

export default function UserProfile({ params }: Props) {
  const router = useRouter();
  const { id } = params;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      const token = Cookies.get("token");

      const response = await fetch(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.message || "User not found");
      }
    } catch (err) {
      setError("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id, fetchUser]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            {error || "User Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            The user with ID #{id} could not be found or you don&apos;t have
            permission to view this profile.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "OFFICER":
        return "bg-blue-100 text-blue-800";
      case "CITIZEN":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      <div className="w-full max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-600">
          <button
            onClick={() => router.push("/")}
            className="hover:text-indigo-600"
          >
            Home
          </button>
          <span className="mx-2">/</span>
          <button
            onClick={() => router.push("/dashboard")}
            className="hover:text-indigo-600"
          >
            Dashboard
          </button>
          <span className="mx-2">/</span>
          <button
            onClick={() => router.push("/users")}
            className="hover:text-indigo-600"
          >
            Users
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">User #{id}</span>
        </nav>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mr-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}
            >
              {user.role}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">
                User ID
              </h3>
              <p className="text-gray-900">#{user.id}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">
                Email
              </h3>
              <p className="text-gray-900">{user.email}</p>
            </div>

            {user.phone && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">
                  Phone
                </h3>
                <p className="text-gray-900">{user.phone}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Role</h3>
              <p className="text-gray-900">{user.role}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">
                Member Since
              </h3>
              <p className="text-gray-900">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => {
              const nextId = parseInt(id) + 1;
              router.push(`/users/${nextId}`);
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Next User →
          </button>
        </div>
      </div>
    </main>
  );
}
