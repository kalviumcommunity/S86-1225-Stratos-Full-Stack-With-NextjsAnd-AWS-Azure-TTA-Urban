"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

export default function Dashboard() {
  const router = useRouter();
  const token = Cookies.get("token");

  // Decode token outside of effect to avoid setState in effect
  let decoded = null;
  if (token) {
    try {
      decoded = jwt.decode(token);
    } catch (err) {
      // Token decode failed
    }
  }

  const [user] = useState<any>(decoded);

  function handleLogout() {
    Cookies.remove("token");
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-md">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm">
                <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded text-xs font-medium">
                  {user.role}
                </span>
              </p>
            </div>
          )}

          <p className="text-gray-600 mb-8">
            Only authenticated users can access this page. This is a protected
            route that requires a valid JWT token in cookies.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="text-lg font-semibold mb-1">Total Complaints</h3>
              <p className="text-3xl font-bold">142</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-lg font-semibold mb-1">Resolved</h3>
              <p className="text-3xl font-bold">98</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">⏳</div>
              <h3 className="text-lg font-semibold mb-1">Pending</h3>
              <p className="text-3xl font-bold">44</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm text-gray-600">2 hours ago</p>
                <p className="font-medium">New complaint submitted</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <p className="text-sm text-gray-600">5 hours ago</p>
                <p className="font-medium">Complaint #142 resolved</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="text-sm text-gray-600">1 day ago</p>
                <p className="font-medium">
                  Officer assigned to complaint #141
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-left">
                ➕ Submit New Complaint
              </button>
              <button
                onClick={() => router.push("/users/1")}
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition text-left"
              >
                👤 View User Profiles
              </button>
              <button className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition text-left">
                📊 View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
