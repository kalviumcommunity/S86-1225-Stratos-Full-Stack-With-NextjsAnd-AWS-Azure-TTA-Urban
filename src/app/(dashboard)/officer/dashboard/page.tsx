'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiClipboard, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';
import NotificationsPanel from '@/components/NotificationsPanel';
import OfficerFeedbackStats from '@/components/OfficerFeedbackStats';

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  category: string;
  location: { address: string };
  status: string;
  createdAt: string;
  assignedAt: string;
  slaDeadline: string;
  createdBy: { name: string; email: string };
}

interface DashboardData {
  stats: {
    totalAssigned: number;
    inProgress: number;
    resolved: number;
    slaBreached: number;
  };
  complaints: Complaint[];
}

export default function OfficerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'OFFICER') {
      router.push('/complaints');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/officer/dashboard');
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
      </div>
    );
  }

  if (!data) {
    return <div>Error loading dashboard</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Officer Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {session?.user?.name}
              </p>
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
                href="/officer/profile"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's an overview of your assigned complaints
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/officer/complaints?filter=assigned" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiClipboard className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assigned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.totalAssigned}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/officer/complaints?filter=inProgress" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiClock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.inProgress}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/officer/complaints?filter=resolved" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.resolved}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/officer/complaints?filter=breached" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SLA Breached</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.slaBreached}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Officer Feedback Stats */}
        <div>
          <OfficerFeedbackStats />
        </div>
      </main>
    </div>
  );
}
