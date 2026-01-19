'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLogOut, FiUser, FiMail, FiBriefcase, FiShield } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';
import NotificationsPanel from '@/components/NotificationsPanel';

interface User {
  name: string;
  email: string;
  role: string;
  department?: string;
}

export default function OfficerProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'OFFICER') {
        router.push('/complaints');
      } else {
        setUser({
          name: session.user?.name || '',
          email: session.user?.email || '',
          role: (session.user as any).role,
          department: (session.user as any).department,
        });
      }
    }
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading' || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/officer/dashboard"
                className="p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Officer Profile</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage your profile information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationsPanel userRole="OFFICER" />
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <Link
                href="/officer/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <FiUser className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                  <FiShield className="w-3 h-3 mr-1" />
                  Officer
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  Full Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <FiMail className="w-4 h-4 mr-2" />
                  Email Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</dd>
              </div>

              {user.department && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <FiBriefcase className="w-4 h-4 mr-2" />
                    Department
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.department}</dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <FiShield className="w-4 h-4 mr-2" />
                  Role
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">Officer</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Account Status
                </dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Active
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 dark:hover:bg-red-800 flex items-center justify-center gap-2 transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
