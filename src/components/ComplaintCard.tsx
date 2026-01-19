import Link from 'next/link';
import { IComplaint } from '@/models/Complaint';
import StatusBadge from './StatusBadge';
import { ComplaintStatus } from '@/utils/constants';

interface ComplaintCardProps {
  complaint: IComplaint & {
    createdBy?: { name: string; email: string };
    assignedTo?: { name: string; email: string; department?: string };
  };
  showCreator?: boolean;
  showOfficer?: boolean;
  linkPrefix?: string;
}

export default function ComplaintCard({
  complaint,
  showCreator = false,
  showOfficer = false,
  linkPrefix = '/complaints',
}: ComplaintCardProps) {
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`${linkPrefix}/${complaint._id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-blue-400 cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {complaint.title}
            </h3>
            <p className="text-sm text-gray-500 mb-2">{complaint.complaintId}</p>
          </div>
          <StatusBadge status={complaint.status as ComplaintStatus} />
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {complaint.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
            {complaint.category}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
            📍 {complaint.location.address}
          </span>
        </div>

        {showCreator && complaint.createdBy && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Submitted by:</span> {complaint.createdBy.name}
          </p>
        )}

        {showOfficer && complaint.assignedTo && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Assigned to:</span> {complaint.assignedTo.name}
            {complaint.assignedTo.department && ` (${complaint.assignedTo.department})`}
          </p>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
          <span>{formattedDate}</span>
          {complaint.images && complaint.images.length > 0 && (
            <span className="flex items-center">
              📷 {complaint.images.length} image{complaint.images.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
