"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export default function Home() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();

  return (
    <main
      className={`min-h-screen p-6 transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Context & Hooks Demo 🚀
        </h1>

        {/* Auth State Section */}
        <section
          className={`mb-8 p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            🔐 Authentication State
          </h2>
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg">
                <span className="font-semibold">Logged in as:</span>{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {user}
                </span>
              </p>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                You are not currently logged in.
              </p>
              <button
                onClick={() => login("KalviumUser")}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                🔑 Login as KalviumUser
              </button>
            </div>
          )}
        </section>

        {/* UI Controls Section */}
        <section
          className={`mb-8 p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            🎨 UI Controls
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg">
                <span className="font-semibold">Current Theme:</span>{" "}
                <span
                  className={`px-3 py-1 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-yellow-200 text-gray-800"}`}
                >
                  {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
                </span>
              </p>
              <button
                onClick={toggleTheme}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-600">
              <p className="text-lg">
                <span className="font-semibold">Sidebar Status:</span>{" "}
                <span
                  className={`px-3 py-1 rounded-full ${sidebarOpen ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                >
                  {sidebarOpen ? "📂 Open" : "📁 Closed"}
                </span>
              </p>
              <button
                onClick={toggleSidebar}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg transition-colors font-medium"
              >
                {sidebarOpen ? "✖️ Close Sidebar" : "☰ Open Sidebar"}
              </button>
            </div>
          </div>
        </section>

        {/* State Overview Section */}
        <section
          className={`p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            📊 Current State Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}
            >
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                Auth Context
              </h3>
              <ul className="space-y-1 text-sm">
                <li>✅ User: {user || "null"}</li>
                <li>✅ Is Authenticated: {isAuthenticated.toString()}</li>
              </ul>
            </div>
            <div
              className={`p-4 rounded ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}
            >
              <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                UI Context
              </h3>
              <ul className="space-y-1 text-sm">
                <li>✅ Theme: {theme}</li>
                <li>✅ Sidebar Open: {sidebarOpen.toString()}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <div
          className={`mt-8 p-6 rounded-lg border-2 ${theme === "dark" ? "border-indigo-500 bg-gray-800" : "border-indigo-300 bg-indigo-50"}`}
        >
          <h3 className="text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
            💡 How It Works
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              🔹 <strong>Context API</strong>: Provides global state management
              for Auth and UI
            </li>
            <li>
              🔹 <strong>Custom Hooks</strong>: Clean interface (useAuth, useUI)
              to access context
            </li>
            <li>
              🔹 <strong>Type Safety</strong>: Full TypeScript support with
              interfaces
            </li>
            <li>
              🔹 <strong>Performance</strong>: Minimal re-renders with proper
              context separation
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
