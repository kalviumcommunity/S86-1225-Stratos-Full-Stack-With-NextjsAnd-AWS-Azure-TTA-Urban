'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiUser, FiCalendar, FiFileText, FiImage, FiCopy, FiDownload, FiCheck } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';
import FeedbackForm from '@/components/FeedbackForm';

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images?: string[];
  resolutionProof?: string[];
  resolutionNotes?: string;
  resolvedAt?: string;
  createdBy: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    department: string;
  };
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    changedBy?: string;
    notes?: string;
  }>;
}

export default function ComplaintDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const complaintId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { theme } = useTheme();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackExists, setFeedbackExists] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);

  const copyComplaintId = () => {
    if (complaint?.complaintId) {
      navigator.clipboard.writeText(complaint.complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadComplaint = () => {
    if (!complaint) return;

    // Create a formatted HTML document with embedded images
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Complaint ${complaint.complaintId}</title>
  <style>
    @page {
      margin: 20mm;
      size: A4;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #14b8a6;
    }
    h1 {
      color: #14b8a6;
      margin: 0;
      font-size: 24px;
    }
    .complaint-id {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #14b8a6;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      padding: 10px;
      background: #f9fafb;
      border-radius: 5px;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      margin-top: 3px;
      color: #333;
      font-size: 14px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .status-new { background: #dbeafe; color: #1e40af; }
    .status-assigned { background: #fef3c7; color: #92400e; }
    .status-in_progress { background: #fed7aa; color: #9a3412; }
    .status-resolved { background: #d1fae5; color: #065f46; }
    .timeline-item {
      padding: 15px;
      background: #f9fafb;
      border-left: 4px solid #14b8a6;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    .timeline-status {
      font-weight: bold;
      color: #14b8a6;
    }
    .timeline-date {
      font-size: 12px;
      color: #666;
      margin-top: 3px;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .image-container {
      border: 1px solid #e5e7eb;
      border-radius: 5px;
      overflow: hidden;
      aspect-ratio: 1;
    }
    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>TTA Urban Grievance Management System</h1>
    <div class="complaint-id">Complaint Details</div>
  </div>

  <div class="section">
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Complaint ID</div>
        <div class="info-value">${complaint.complaintId}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">
          <span class="status-badge status-${complaint.status.toLowerCase()}">${formatStatus(complaint.status)}</span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Category</div>
        <div class="info-value">${complaint.category}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Priority</div>
        <div class="info-value">${complaint.priority || 'Not specified'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Title</div>
    <div>${complaint.title}</div>
  </div>

  <div class="section">
    <div class="section-title">Description</div>
    <div>${complaint.description}</div>
  </div>

  <div class="section">
    <div class="section-title">Location</div>
    <div>${complaint.location.address}</div>
    ${complaint.location.coordinates ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">Coordinates: ${complaint.location.coordinates.lat}, ${complaint.location.coordinates.lng}</div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Reporter Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Name</div>
        <div class="info-value">${complaint.createdBy.name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${complaint.createdBy.email}</div>
      </div>
    </div>
  </div>

  ${complaint.assignedTo ? `
  <div class="section">
    <div class="section-title">Assigned To</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Name</div>
        <div class="info-value">${complaint.assignedTo.name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Department</div>
        <div class="info-value">${complaint.assignedTo.department}</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${complaint.images && complaint.images.length > 0 && !complaint.images[0].includes('placeholder') ? `
  <div class="section">
    <div class="section-title">Images</div>
    <div class="images-grid">
      ${complaint.images.map((image, index) => `
        <div class="image-container">
          <img src="${image}" alt="Complaint image ${index + 1}" />
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Timeline</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Created</div>
        <div class="info-value">${new Date(complaint.createdAt).toLocaleString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Last Updated</div>
        <div class="info-value">${new Date(complaint.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  </div>

  ${complaint.statusHistory && complaint.statusHistory.length > 0 ? `
  <div class="section">
    <div class="section-title">Status History</div>
    ${complaint.statusHistory.map((item, index) => `
      <div class="timeline-item">
        <div class="timeline-status">${index + 1}. ${formatStatus(item.status)}</div>
        <div class="timeline-date">${new Date(item.timestamp).toLocaleString()}</div>
        ${item.changedBy ? `<div style="margin-top: 5px; font-size: 14px;">Changed by: ${item.changedBy}</div>` : ''}
        ${item.notes ? `<div style="margin-top: 5px; font-size: 14px; color: #666;">${item.notes}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <div>TTA Urban Grievance Management System</div>
    <div>Generated on: ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>
    `;

    // Create a blob and download as HTML file (can be saved as PDF from browser)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complaint-${complaint.complaintId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && complaintId) {
      fetchComplaintDetails();
    }
  }, [status, complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`);
      if (response.ok) {
        const data = await response.json();
        setComplaint(data.complaint);
        // Check if feedback exists
        await checkFeedback();
      } else {
        setError('Failed to load complaint details');
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      setError('An error occurred while loading complaint details');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFeedback = async () => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/feedback`);
      if (response.ok) {
        const data = await response.json();
        setFeedbackExists(data.exists);
        setFeedbackData(data.feedback);
      }
    } catch (error) {
      console.error('Error checking feedback:', error);
    }
  };

  const handleFeedbackSuccess = () => {
    // Refresh complaint details to show CLOSED status
    fetchComplaintDetails();
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
      case 'RESOLVED':
      case 'CLOSED':
        return <FiCheckCircle className="w-5 h-5" />;
      default:
        return <FiAlertCircle className="w-5 h-5" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Complaint Not Found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The complaint you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              href="/complaints"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-all"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
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
              href="/complaints"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                ID: {complaint.complaintId}
              </span>
              <button
                onClick={copyComplaintId}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Copy Complaint ID"
              >
                {copied ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {complaint.title}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                      {getStatusIcon(complaint.status)}
                      {formatStatus(complaint.status)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                      {complaint.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={downloadComplaint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-all"
                  title="Download Complaint Details"
                >
                  <FiDownload className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(complaint.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiFileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {complaint.location.address}
              </p>
              {complaint.location.coordinates && (
                <>\n                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Coordinates: {complaint.location.coordinates.lat}, {complaint.location.coordinates.lng}
                  </p>
                  {/* Map Preview */}
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(complaint.location.coordinates.lng) - 0.01},${parseFloat(complaint.location.coordinates.lat) - 0.01},${parseFloat(complaint.location.coordinates.lng) + 0.01},${parseFloat(complaint.location.coordinates.lat) + 0.01}&layer=mapnik&marker=${complaint.location.coordinates.lat},${complaint.location.coordinates.lng}`}
                      style={{ border: 0 }}
                    ></iframe>
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${complaint.location.coordinates.lat}&mlon=${complaint.location.coordinates.lng}#map=15/${complaint.location.coordinates.lat}/${complaint.location.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    View larger map →
                  </a>
                </>
              )}
            </div>

            {/* Images */}
            {complaint.images && complaint.images.length > 0 && !complaint.images[0].includes('placeholder') && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiImage className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Images</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={image}
                        alt={`Complaint image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Proof */}
            {complaint.status === 'RESOLVED' && complaint.resolutionProof && complaint.resolutionProof.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">Resolution Proof</h2>
                </div>
                {complaint.resolutionNotes && (
                  <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resolution Notes:</p>
                    <p className="text-gray-900 dark:text-white">{complaint.resolutionNotes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.resolutionProof.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-600">
                      <img
                        src={image}
                        alt={`Resolution proof ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
                {complaint.resolvedAt && (
                  <p className="text-sm text-green-700 dark:text-green-300 mt-4">
                    Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Feedback Section - Only show for RESOLVED complaints if feedback not submitted yet */}
            {complaint.status === 'RESOLVED' && session?.user.role === 'CITIZEN' && !feedbackExists && (
              <FeedbackForm complaintId={complaintId as string} onSuccess={handleFeedbackSuccess} />
            )}

            {/* Feedback Already Submitted */}
            {feedbackExists && feedbackData && session?.user.role === 'CITIZEN' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Feedback Submitted
                  </h3>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= feedbackData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill={star <= feedbackData.rating ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {feedbackData.comment && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Comment:</p>
                      <p className="text-gray-900 dark:text-white text-sm">{feedbackData.comment}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Submitted on: {new Date(feedbackData.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Citizen Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reported By</h2>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{complaint.createdBy.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{complaint.createdBy.email}</p>
              </div>
            </div>

            {/* Assigned Officer */}
            {complaint.assignedTo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned To</h2>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">{complaint.assignedTo.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{complaint.assignedTo.department}</p>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Status Timeline</h2>
              <div className="space-y-6">
                {/* Visual Progress Stages */}
                <div className="grid grid-cols-4 gap-2">
                  {['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((stage, idx) => {
                    const isCompleted = complaint.statusHistory?.some(h => h.status === stage) || false;
                    const isCurrent = complaint.status === stage;
                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isCurrent ? 'bg-teal-500 text-white ring-4 ring-teal-200 dark:ring-teal-800' :
                          isCompleted ? 'bg-green-500 text-white' :
                          'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}>
                          {isCompleted && <FiCheckCircle className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs text-center font-medium ${
                          isCurrent ? 'text-teal-600 dark:text-teal-400' :
                          isCompleted ? 'text-gray-900 dark:text-white' :
                          'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatStatus(stage)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Detailed Timeline */}
                {complaint.statusHistory && complaint.statusHistory.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Detailed History</h3>
                    <div className="space-y-4">
                      {complaint.statusHistory.map((entry, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(entry.status)}`}>
                              {getStatusIcon(entry.status)}
                            </div>
                            {index < complaint.statusHistory.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatStatus(entry.status)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(entry.changedAt).toLocaleString()}
                            </p>
                            {entry.notes && (
                              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {entry.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
