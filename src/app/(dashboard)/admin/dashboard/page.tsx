'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiUsers,
  FiClipboard,
  FiActivity,
  FiStar,
} from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';
import NotificationsPanel from '@/components/NotificationsPanel';

interface DashboardData {
  kpis: {
    totalComplaints: number;
    resolvedPercentage: number;
    avgResolutionTime: number;
    slaBreached: number;
  };
  charts: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    daily: Array<{ date: string; count: number }>;
  };
  officerPerformance: Array<{
    _id: string;
    name: string;
    department: string;
    assigned: number;
    resolved: number;
    avgResolutionTime: number;
    slaBreaches: number;
  }>;
  feedbackStats?: {
    totalFeedbacks: number;
    averageRating: number;
    lowRatings: number;
    highRatings: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/complaints');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {session?.user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationsPanel userRole="ADMIN" />
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
                href="/admin/complaints"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Complaints
              </Link>
              <Link
                href="/admin/users"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Users
              </Link>
              <Link
                href="/admin/audit-logs"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Audit Logs
              </Link>
              <Link
                href="/admin/profile"
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
                Here's an overview of the complaint management system
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiFileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kpis.totalComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved %</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kpis.resolvedPercentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiClock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kpis.avgResolutionTime}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SLA Breached</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kpis.slaBreached}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Statistics Section */}
        {data.feedbackStats && data.feedbackStats.totalFeedbacks > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Service Feedback</h2>
              <Link
                href="/admin/feedback"
                className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiStar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Feedbacks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.feedbackStats.totalFeedbacks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiStar className="h-8 w-8 text-yellow-600 fill-current" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.feedbackStats.averageRating} ⭐</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiCheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Ratings (4-5⭐)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.feedbackStats.highRatings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiAlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Ratings (1-2⭐)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.feedbackStats.lowRatings}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Complaints by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complaints by Category</h3>
            <div className="space-y-3">
              {Object.entries(data.charts.byCategory)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (count / data.kpis.totalComplaints) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Complaints by Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complaints by Status</h3>
            <div className="space-y-3">
              {['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => {
                const count = data.charts.byStatus[status] || 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{status.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${data.kpis.totalComplaints > 0 ? (count / data.kpis.totalComplaints) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Submissions (Last 7 Days)</h3>
          <div className="flex items-end gap-2 h-48">
            {data.charts.daily.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-teal-600 rounded-t" style={{ height: `${day.count * 20}px` }} />
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{new Date(day.date).getDate()}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{day.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Officer Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiUsers />
              Officer Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Resolved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avg Time (hrs)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    SLA Breaches
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.officerPerformance.map((officer) => (
                  <tr key={officer._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {officer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {officer.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {officer.assigned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {officer.resolved}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {officer.avgResolutionTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          officer.slaBreaches > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {officer.slaBreaches}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
