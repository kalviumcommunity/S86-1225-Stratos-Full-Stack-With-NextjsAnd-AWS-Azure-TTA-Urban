'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FiArrowLeft, FiMapPin, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { ssr: false });

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  images: string[];
  resolutionProof?: string[];
  resolutionNotes?: string;
  resolvedAt?: string;
  slaDeadline: string;
  createdBy: {
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    name: string;
    email: string;
    department: string;
  };
  officerComments?: Array<{
    comment: string;
    addedBy: { name: string };
    addedAt: string;
  }>;
}

export default function AdminComplaintDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fromNotifications = searchParams.get('from') === 'notifications';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/complaints');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (params.id) {
      fetchComplaint();
    }
  }, [params.id]);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`/api/complaints/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaint(data.complaint);
      } else {
        console.error('Failed to fetch complaint');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
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

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Complaint not found</p>
          <Link href="/admin/complaints" className="text-teal-600 hover:text-teal-700">
            Back to Complaints
          </Link>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (fromNotifications) {
      router.push('/admin/notifications');
    } else {
      router.push('/admin/complaints');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaint Details</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{complaint.complaintId}</p>
              </div>
            </div>
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{complaint.title}</h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-gray-900 dark:text-white">{complaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Category</p>
                    <p className="text-gray-900 dark:text-white">{complaint.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">SLA Deadline</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(complaint.slaDeadline).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Location</p>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    {complaint.location.address}
                  </p>
                </div>

                {/* Images */}
                {complaint.images && complaint.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Complaint Images</p>
                    <div className="grid grid-cols-2 gap-4">
                      {complaint.images.map((img, idx) => (
                        <div key={idx} className="relative h-48 rounded-lg overflow-hidden">
                          <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map */}
                {complaint.location.lat && complaint.location.lng && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Map Location</p>
                    <div className="h-64 rounded-lg overflow-hidden">
                      <MapWithNoSSR
                        center={[complaint.location.lat, complaint.location.lng]}
                        zoom={15}
                        markers={[
                          {
                            position: [complaint.location.lat, complaint.location.lng],
                            popup: complaint.location.address,
                          },
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Officer Comments */}
            {complaint.officerComments && complaint.officerComments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Notes</h3>
                <div className="space-y-3">
                  {complaint.officerComments.map((comment, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {comment.addedBy.name} • {new Date(comment.addedAt).toLocaleString()}
                      </p>
                      <p className="text-gray-900 dark:text-white">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {complaint.status === 'RESOLVED' && complaint.resolutionProof && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resolution</h3>
                
                {complaint.resolutionNotes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Resolution Notes</p>
                    <p className="text-gray-900 dark:text-white">{complaint.resolutionNotes}</p>
                  </div>
                )}

                {complaint.resolutionProof.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Resolution Proof</p>
                    <div className="grid grid-cols-2 gap-4">
                      {complaint.resolutionProof.map((img, idx) => (
                        <div key={idx} className="relative h-48 rounded-lg overflow-hidden">
                          <Image src={img} alt={`Proof ${idx + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Citizen Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiUser />
                Submitted By
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{complaint.createdBy.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{complaint.createdBy.email}</p>
                </div>
                {complaint.createdBy.phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{complaint.createdBy.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Officer */}
            {complaint.assignedTo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assigned Officer</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">{complaint.assignedTo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                    <p className="text-gray-900 dark:text-white">{complaint.assignedTo.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">{complaint.assignedTo.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiCalendar />
                Timeline
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-gray-900 dark:text-white">{new Date(complaint.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-gray-900 dark:text-white">{new Date(complaint.updatedAt).toLocaleString()}</p>
                </div>
                {complaint.resolvedAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                    <p className="text-gray-900 dark:text-white">{new Date(complaint.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
