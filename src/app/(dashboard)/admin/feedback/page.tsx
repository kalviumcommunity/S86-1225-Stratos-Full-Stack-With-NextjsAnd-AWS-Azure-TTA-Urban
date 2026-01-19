'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiStar, FiAlertCircle, FiUsers, FiTrendingUp, FiFilter, FiArrowLeft } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

interface FeedbackItem {
  id: string;
  complaintId: {
    _id: string;
    complaintId: string;
    title: string;
    category: string;
  } | null;
  citizen: {
    id: string;
    name: string;
    email: string;
  } | null;
  officer: {
    id: string;
    name: string;
    email: string;
    department: string;
  } | null;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface OfficerStat {
  officerId: string;
  officerName: string;
  department: string;
  totalFeedbacks: number;
  averageRating: number;
  lowestRating: number;
  highestRating: number;
}

interface LowRatingAlert {
  id: string;
  complaintId: string;
  complaintTitle: string;
  citizenName: string;
  officerName: string;
  department: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [officerStats, setOfficerStats] = useState<OfficerStat[]>([]);
  const [lowRatingAlerts, setLowRatingAlerts] = useState<LowRatingAlert[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'stats' | 'alerts'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchFeedbackData();
      }
    }
  }, [status, session, page]);

  const fetchFeedbackData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/feedback?page=${page}&limit=20`);
      
      console.log('Feedback API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Feedback data received:', data);
        console.log('Number of feedbacks:', data.feedbacks?.length);
        setFeedbacks(data.feedbacks || []);
        setOfficerStats(data.officerStats || []);
        setLowRatingAlerts(data.lowRatingAlerts || []);
        setOverallStats(data.overallStats);
        setTotalPages(data.pagination.totalPages);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError('Failed to load feedback data');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('An error occurred while loading feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Toggle theme"
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Feedback & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor service quality and officer performance
          </p>
        </div>

        {/* Overall Statistics Cards */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FiStar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Feedbacks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.totalFeedbacks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.averageRating.toFixed(2)} ⭐
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FiStar className="w-6 h-6 text-green-600 dark:text-green-400 fill-current" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">5-Star Ratings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.ratingDistribution[5] || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Low Ratings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(overallStats.ratingDistribution[1] || 0) + (overallStats.ratingDistribution[2] || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                All Feedbacks
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Officer Statistics
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'alerts'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Low Rating Alerts
                {lowRatingAlerts.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                    {lowRatingAlerts.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* All Feedbacks Tab */}
            {activeTab === 'all' && (
              <div className="space-y-4">
                {feedbacks.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No feedback submitted yet
                  </p>
                ) : (
                  feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {feedback.complaintId ? (
                              <>
                                <Link
                                  href={`/admin/complaints/${feedback.complaintId._id}`}
                                  className="font-medium text-teal-600 dark:text-teal-400 hover:underline"
                                >
                                  {feedback.complaintId.complaintId}
                                </Link>
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                                  {feedback.complaintId.category}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500">Complaint deleted</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {feedback.complaintId?.title || 'N/A'}
                          </p>
                        </div>
                        {renderStars(feedback.rating)}
                      </div>

                      {feedback.comment && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            "{feedback.comment}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>Citizen: {feedback.citizen?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>Officer: {feedback.officer?.name || 'Unknown'} {feedback.officer?.department && `(${feedback.officer.department})`}</span>
                        </div>
                        <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Officer Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {officerStats.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No officer statistics available
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Officer
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Department
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Feedbacks
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Avg Rating
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Range
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {officerStats.map((stat) => (
                          <tr
                            key={stat.officerId}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {stat.officerName}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.department}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-gray-900 dark:text-white">
                                {stat.totalFeedbacks}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className={`font-semibold ${
                                  stat.averageRating >= 4 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : stat.averageRating >= 3 
                                    ? 'text-yellow-600 dark:text-yellow-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {stat.averageRating.toFixed(2)}
                                </span>
                                <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.lowestRating} - {stat.highestRating}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Low Rating Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                {lowRatingAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <FiStar className="w-12 h-12 text-green-500 mx-auto mb-3 fill-current" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No low ratings! Great service quality.
                    </p>
                  </div>
                ) : (
                  lowRatingAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              href={`/admin/complaints/${alert.complaintId}`}
                              className="font-medium text-teal-600 dark:text-teal-400 hover:underline"
                            >
                              {alert.complaintId}
                            </Link>
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded font-semibold">
                              ⚠️ Rating: {alert.rating}/5
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {alert.complaintTitle}
                          </p>
                        </div>
                      </div>

                      {alert.comment && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            "{alert.comment}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>Officer: {alert.officerName} ({alert.department})</span>
                          <span>•</span>
                          <span>Citizen: {alert.citizenName}</span>
                        </div>
                        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
