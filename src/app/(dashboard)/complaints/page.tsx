'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiEye, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';
import NotificationsPanel from '@/components/NotificationsPanel';

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  location: {
    address: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
  }>;
}

export default function ComplaintsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    avgResolutionTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Clear local storage and redirect
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/api/auth/logout';
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchComplaints();
      fetchStats();
    }
  }, [status, router]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints');
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/complaints/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ASSIGNED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return <FiClock className="w-4 h-4" />;
      case 'RESOLVED':
      case 'CLOSED':
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'NEW':
        return 25;
      case 'ASSIGNED':
        return 50;
      case 'IN_PROGRESS':
        return 75;
      case 'RESOLVED':
      case 'CLOSED':
        return 100;
      default:
        return 0;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500';
      case 'ASSIGNED':
        return 'bg-yellow-500';
      case 'IN_PROGRESS':
        return 'bg-orange-500';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TTA-Urban</span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsPanel />
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
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <Link href="/profile" className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {session?.user?.name}
                </Link>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </>
                ) : (
                  <>
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Here's an overview of your grievances
              </p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Complaints</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.resolved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resolution</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.avgResolutionTime}d</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Complaints</h2>
          <Link
            href="/complaints/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-all shadow-sm"
          >
            <FiPlus className="w-5 h-5" />
            File New Complaint
          </Link>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
              <FiAlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Complaints Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start by filing your first complaint to make your city better.</p>
              <Link
                href="/complaints/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-all"
              >
                <FiPlus className="w-5 h-5" />
                File Your First Complaint
              </Link>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{complaint.complaintId}</span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{complaint.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {complaint.location?.address || 'Location not specified'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                        {complaint.category}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{getProgressPercentage(complaint.status)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(complaint.status)}`}
                          style={{ width: `${getProgressPercentage(complaint.status)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/complaints/${complaint._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium transition-all ml-4"
                  >
                    <FiEye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
