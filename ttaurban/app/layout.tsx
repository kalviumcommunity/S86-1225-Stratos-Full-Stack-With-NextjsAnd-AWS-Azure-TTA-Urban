import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import SWRProvider from "@/components/SWRProvider";
import ToastProvider from "@/components/ui/Toast";
import ThemeToggle from "@/components/ui/ThemeToggle";
import "./globals.css";
import Link from "next/link";
import LayoutController from "@/components/layout/LayoutController";

export const metadata = {
  title: "TTA Urban - Urban Complaint Management System",
  description: "A comprehensive complaint management system for urban areas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider>
            <SWRProvider>
              <ToastProvider />
              <LayoutController>
                <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                      <div className="flex items-center space-x-4 md:space-x-8">
                        <Link
                          href="/"
                          className="text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                          🏙️ TTA-Urban
                        </Link>
                        <div className="hidden md:flex space-x-4">
                          <Link
                            href="/"
                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Home
                          </Link>
                          <Link
                            href="/dashboard"
                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/users/1"
                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Users
                          </Link>
                          <Link
                            href="/contact"
                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Contact
                          </Link>
                          <Link
                            href="/feedback-demo"
                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Feedback Demo
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                          href="/login"
                          className="bg-indigo-600 dark:bg-indigo-500 text-white px-3 md:px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                        >
                          Sign In
                        </Link>
                      </div>
                    </div>
                  </div>
                </nav>
                {children}
              </LayoutController>
            </SWRProvider>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
