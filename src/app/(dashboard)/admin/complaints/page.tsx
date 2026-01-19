'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiFilter, FiSearch, FiUserPlus } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  category: string;
  status: string;
  location: { address: string };
  createdBy: { name: string };
  assignedTo?: { name: string; department: string };
  slaDeadline: string;
  createdAt: string;
}

interface Officer {
  _id: string;
  name: string;
  department: string;
}

export default function AdminComplaintsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/complaints');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchComplaints();
    fetchOfficers();
  }, [statusFilter, categoryFilter, searchTerm]);

  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/complaints?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await fetch('/api/admin/users?role=OFFICER');
      if (res.ok) {
        const data = await res.json();
        setOfficers(data.users);
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
    }
  };

  const handleAssign = async (complaintId: string) => {
    if (!selectedOfficer) {
      alert('Please select an officer');
      return;
    }

    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId, officerId: selectedOfficer }),
      });

      if (res.ok) {
        setAssigningTo(null);
        setSelectedOfficer('');
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-purple-100 text-purple-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800';
    }
  };

  const isSLABreached = (slaDeadline: string, status: string) => {
    return new Date(slaDeadline) < new Date() && status !== 'RESOLVED' && status !== 'CLOSED';
  };

  if (status === 'loading' || loading) {
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
              <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Complaints</h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiFilter className="inline mr-2" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                suppressHydrationWarning
              >
                <option value="all">All</option>
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                suppressHydrationWarning
              >
                <option value="all">All Categories</option>
                <option value="Road & Infrastructure">Road & Infrastructure</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Garbage Collection">Garbage Collection</option>
                <option value="Street Lighting">Street Lighting</option>
                <option value="Drainage">Drainage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiSearch className="inline mr-2" />
                Search by ID
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter complaint ID..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500"
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700"><tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    SLA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {complaint.complaintId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {complaint.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {complaint.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {assigningTo === complaint._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedOfficer}
                              onChange={(e) => setSelectedOfficer(e.target.value)}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">Select Officer</option>
                              {officers.map((officer) => (
                                <option key={officer._id} value={officer._id}>
                                  {officer.name} ({officer.department})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssign(complaint._id)}
                              className="px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => {
                                setAssigningTo(null);
                                setSelectedOfficer('');
                              }}
                              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : complaint.assignedTo ? (
                          <span>
                            {complaint.assignedTo.name}
                            <br />
                            <span className="text-xs text-gray-500">
                              {complaint.assignedTo.department}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSLABreached(complaint.slaDeadline, complaint.status) ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Breached
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(complaint.slaDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!complaint.assignedTo && complaint.status === 'NEW' && (
                          <button
                            onClick={() => setAssigningTo(complaint._id)}
                            className="text-teal-600 hover:text-teal-900 flex items-center gap-1"
                          >
                            <FiUserPlus />
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

