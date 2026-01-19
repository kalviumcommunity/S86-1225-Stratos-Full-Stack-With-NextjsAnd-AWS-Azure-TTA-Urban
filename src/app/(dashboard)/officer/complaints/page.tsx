'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';
import NotificationsPanel from '@/components/NotificationsPanel';
import StatusBadge from '@/components/StatusBadge';

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
  resolvedAt?: string;
  createdBy: { name: string; email: string };
}

export default function OfficerComplaintsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({ totalAssigned: 0, inProgress: 0, resolved: 0, slaBreached: 0 });
  const [loading, setLoading] = useState(true);

  const filter = searchParams.get('filter') || 'all';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'OFFICER') {
      router.push('/complaints');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats and complaints in parallel
      const [statsRes, complaintsRes] = await Promise.all([
        fetch('/api/officer/dashboard'),
        fetch('/api/officer/complaints')
      ]);
      
      if (statsRes.ok && complaintsRes.ok) {
        const statsData = await statsRes.json();
        const complaintsData = await complaintsRes.json();
        
        setStats(statsData.stats);
        setComplaints(complaintsData.complaints);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredComplaints = () => {
    if (!complaints) return [];

    switch (filter) {
      case 'assigned':
        return complaints;
      case 'inProgress':
        return complaints.filter((c) => c.status === 'IN_PROGRESS');
      case 'resolved':
        return complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');
      case 'breached':
        return complaints.filter((c) => isSLABreached(c));
      default:
        return complaints;
    }
  };

  const getPageTitle = () => {
    switch (filter) {
      case 'assigned':
        return 'All Assigned Complaints';
      case 'inProgress':
        return 'In Progress Complaints';
      case 'resolved':
        return 'Resolved Complaints';
      case 'breached':
        return 'SLA Breached Complaints';
      default:
        return 'All Complaints';
    }
  };

  const isSLABreached = (complaint: Complaint) => {
    if (!complaint.slaDeadline) return false;
    
    const slaDeadline = new Date(complaint.slaDeadline);
    
    // For resolved/closed complaints, check if they were resolved after the deadline
    if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') {
      if (complaint.resolvedAt) {
        return new Date(complaint.resolvedAt) > slaDeadline;
      }
      return false; // If no resolvedAt, can't determine breach
    }
    
    // For open complaints, check if deadline has passed
    return slaDeadline < new Date();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
      </div>
    );
  }

  const filteredComplaints = getFilteredComplaints();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/officer/dashboard"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationsPanel userRole="OFFICER" />
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAssigned}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">SLA Breached</p>
              <p className="text-2xl font-bold text-red-600">{stats.slaBreached}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/officer/complaints?filter=assigned"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'assigned'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Assigned ({stats.totalAssigned})
            </Link>
            <Link
              href="/officer/complaints?filter=inProgress"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'inProgress'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              In Progress ({stats.inProgress})
            </Link>
            <Link
              href="/officer/complaints?filter=resolved"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'resolved'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Resolved ({stats.resolved})
            </Link>
            <Link
              href="/officer/complaints?filter=breached"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'breached'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              SLA Breached ({stats.slaBreached})
            </Link>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No complaints found</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {complaint.complaintId}
                        </h3>
                        <StatusBadge status={complaint.status} />
                        {isSLABreached(complaint) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            <FiAlertTriangle className="w-3 h-3" />
                            SLA Breached
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {complaint.title}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Category:</span> {complaint.category}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {complaint.location.address}
                        </div>
                        <div>
                          <span className="font-medium">SLA Deadline:</span>{' '}
                          {new Date(complaint.slaDeadline).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                        <div>
                          <span className="font-medium">Reported By:</span> {complaint.createdBy.name}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/officer/complaints/${complaint._id}`}
                      className="ml-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
