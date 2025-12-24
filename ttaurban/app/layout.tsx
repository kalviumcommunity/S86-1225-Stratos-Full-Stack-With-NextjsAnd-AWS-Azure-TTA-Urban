import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import SWRProvider from "@/components/SWRProvider";
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
              <LayoutController>
                <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                      <div className="flex items-center space-x-8">
                        <Link
                          href="/"
                          className="text-xl font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          🏙️ TTA-Urban
                        </Link>
                        <div className="hidden md:flex space-x-4">
                          <Link
                            href="/"
                            className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                          >
                            Home
                          </Link>
                          <Link
                            href="/dashboard"
                            className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/users/1"
                            className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                          >
                            Users
                          </Link>
                          <Link
                            href="/contact"
                            className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                          >
                            Contact
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link
                          href="/login"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
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
