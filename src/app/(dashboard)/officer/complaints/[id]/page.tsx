'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FiArrowLeft, FiCheckCircle, FiClock, FiMapPin, FiUpload } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { ssr: false });

interface Comment {
  comment: string;
  addedBy: { name: string };
  addedAt: string;
}

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: string;
  createdBy: {
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo: {
    name: string;
    email: string;
    department: string;
  };
  assignedAt: string;
  officerComments?: Comment[];
  statusHistory: Array<{
    status: string;
    changedAt: string;
    notes?: string;
  }>;
  resolutionProof?: string[];
  resolutionNotes?: string;
  resolvedAt?: string;
  slaDeadline: string;
  createdAt: string;
}

export default function OfficerComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionProof, setResolutionProof] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'OFFICER') {
      router.push('/complaints');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`/api/officer/complaints/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
      } else {
        router.push('/officer/dashboard');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/officer/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (res.ok) {
        fetchComplaint();
      }
    } catch (error) {
      console.error('Error accepting complaint:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/officer/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addComment', comment: newComment }),
      });

      if (res.ok) {
        setNewComment('');
        fetchComplaint();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        uploadedImages.push(base64);
      }

      setResolutionProof([...resolutionProof, ...uploadedImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleResolve = async () => {
    if (resolutionProof.length === 0) {
      alert('Please upload resolution proof');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/officer/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          resolutionProof,
          resolutionNotes,
        }),
      });

      if (res.ok) {
        fetchComplaint();
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
      </div>
    );
  }

  if (!complaint) {
    return <div>Complaint not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
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

                {/* Citizen Images */}
                {complaint.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Citizen Images</p>
                    <div className="grid grid-cols-2 gap-4">
                      {complaint.images.map((img, idx) => (
                        <div key={idx} className="relative h-48 rounded-lg overflow-hidden">
                          <Image
                            src={img}
                            alt={`Evidence ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map */}
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
              </div>
            </div>

            {/* Accept Button */}
            {complaint.status === 'ASSIGNED' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiCheckCircle />
                  {actionLoading ? 'Accepting...' : 'Accept Complaint'}
                </button>
              </div>
            )}

            {/* Officer Comments */}
            {complaint.status === 'IN_PROGRESS' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Notes</h3>

                {complaint.officerComments && complaint.officerComments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {complaint.officerComments.map((comment, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {comment.addedBy.name} • {new Date(comment.addedAt).toLocaleString()}
                        </p>
                        <p className="text-gray-900 dark:text-white">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a progress note..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={actionLoading || !newComment.trim()}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Resolution Section */}
            {complaint.status === 'IN_PROGRESS' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mark as Resolved</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resolution Proof (Required)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer flex items-center gap-2">
                        <FiUpload className="text-gray-700 dark:text-white" />
                        <span className="text-sm font-medium text-gray-700 dark:text-white">
                          {uploading ? 'Uploading...' : 'Upload Images'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <span className="text-sm text-gray-700 dark:text-gray-400">
                        {resolutionProof.length} image(s) uploaded
                      </span>
                    </div>

                    {resolutionProof.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {resolutionProof.map((img, idx) => (
                          <div key={idx} className="relative h-32 rounded-lg overflow-hidden">
                            <Image
                              src={img}
                              alt={`Proof ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resolution Notes (Optional)
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={3}
                      placeholder="Describe how the issue was resolved..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleResolve}
                    disabled={actionLoading || resolutionProof.length === 0}
                    className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle />
                    {actionLoading ? 'Resolving...' : 'Mark as Resolved'}
                  </button>
                </div>
              </div>
            )}

            {/* Resolution Info (for resolved complaints) */}
            {complaint.status === 'RESOLVED' && complaint.resolutionProof && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resolution</h3>

                {complaint.resolutionNotes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</p>
                    <p className="text-gray-900 dark:text-white">{complaint.resolutionNotes}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Proof</p>
                  <div className="grid grid-cols-2 gap-4">
                    {complaint.resolutionProof.map((img, idx) => (
                      <div key={idx} className="relative h-48 rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`Resolution ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiClock />
                Status Timeline
              </h3>
              <div className="space-y-4">
                {complaint.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {history.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(history.changedAt).toLocaleString()}
                      </p>
                      {history.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{history.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Citizen Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{complaint.createdBy.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{complaint.createdBy.email}</p>
                </div>
                {complaint.createdBy.phone && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{complaint.createdBy.phone}</p>
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
