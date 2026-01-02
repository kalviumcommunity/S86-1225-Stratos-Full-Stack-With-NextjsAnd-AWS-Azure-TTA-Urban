"use client";

import React, { useState } from "react";

interface ComplaintCardProps {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: string;
  onStatusChange?: (id: number, newStatus: string) => void;
}

export default function ComplaintCard({
  id,
  title,
  description,
  status,
  createdAt,
  onStatusChange,
}: ComplaintCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as typeof status);
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  return (
    <div
      className="border rounded-lg p-4 shadow-sm bg-white"
      data-testid="complaint-card"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold" data-testid="complaint-title">
          {title}
        </h3>
        <span
          className={`px-2 py-1 rounded text-sm ${statusColors[currentStatus]}`}
          data-testid="complaint-status"
        >
          {currentStatus}
        </span>
      </div>
      <p className="text-gray-600 mb-3" data-testid="complaint-description">
        {description}
      </p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span data-testid="complaint-date">
          Created: {new Date(createdAt).toLocaleDateString()}
        </span>
        <span data-testid="complaint-id">
          ID: CMP-{id.toString().padStart(6, "0")}
        </span>
      </div>
      {onStatusChange && (
        <div className="mt-3 pt-3 border-t">
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            data-testid="status-select"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      )}
    </div>
  );
}
