'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiSearch, FiMapPin, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

interface ComplaintStatus {
  complaintId: string;
  title: string;
  status: string;
  category: string;
  location: string;
  submittedAt: string;
  lastUpdate: string;
}

export default function TrackComplaint() {
  const { theme, toggleTheme } = useTheme();
  const [complaintId, setComplaintId] = useState('');
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<ComplaintStatus | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setComplaint(null);

    if (!complaintId.trim()) {
      setError('Please enter a complaint ID');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/complaints/track/${complaintId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Complaint not found. Please check the ID and try again.');
        } else {
          setError('Failed to fetch complaint details. Please try again.');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setComplaint(data);
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'assigned':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Your Complaint</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter your complaint ID to check status</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              suppressHydrationWarning
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
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="complaintId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Complaint ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="complaintId"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  placeholder="Enter your complaint ID (e.g., COMP001)"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  suppressHydrationWarning
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              suppressHydrationWarning
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <FiSearch className="w-5 h-5" />
                  Track Complaint
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Complaint Details */}
        {complaint && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="bg-teal-600 dark:bg-teal-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Complaint Details</h2>
              <p className="text-sm text-teal-100">ID: {complaint.complaintId}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current Status</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                  {formatStatus(complaint.status)}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Complaint Title</h3>
                <p className="text-gray-900 dark:text-white font-medium">{complaint.title}</p>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Category</h3>
                <p className="text-gray-900 dark:text-white">{complaint.category}</p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Location</h3>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  {typeof complaint.location === 'string' ? complaint.location : complaint.location.address}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Submitted On</h3>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    {new Date(complaint.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Last Updated</h3>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    {new Date(complaint.lastUpdate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Want to view more details or take action? Sign in to your account.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!complaint && !error && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Find Your Complaint ID</h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Check the confirmation email sent when you submitted the complaint</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Sign in to your account to view all your complaints</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Contact support if you cannot find your complaint ID</span>
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
