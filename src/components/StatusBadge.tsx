import { ComplaintStatus } from '@/utils/constants';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    NEW: 'bg-blue-100 text-blue-800 border-blue-200',
    ASSIGNED: 'bg-purple-100 text-purple-800 border-purple-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
    CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels = {
    NEW: 'New',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
