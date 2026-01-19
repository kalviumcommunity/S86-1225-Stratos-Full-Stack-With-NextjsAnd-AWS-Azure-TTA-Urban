'use client';

import { useEffect, useState } from 'react';
import { FiStar } from 'react-icons/fi';

interface OfficerFeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export default function OfficerFeedbackStats() {
  const [stats, setStats] = useState<OfficerFeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedbackStats();
  }, []);

  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch('/api/officer/feedback');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to load feedback statistics');
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      setError('An error occurred while loading feedback');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null; // Don't show error to officer, just hide the component
  }

  if (stats.totalFeedbacks === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiStar className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Feedback
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No feedback received yet. Complete resolved complaints to receive feedback from citizens.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <FiStar className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Feedback
        </h3>
      </div>

      {/* Average Rating */}
      <div className="text-center mb-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {stats.averageRating.toFixed(2)}
          </span>
          <FiStar className="w-8 h-8 text-yellow-500 fill-current" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Average Rating
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Based on {stats.totalFeedbacks} feedback{stats.totalFeedbacks !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Rating Distribution
        </h4>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalFeedbacks > 0 
            ? (count / stats.totalFeedbacks) * 100 
            : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {rating}
                </span>
                <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
              </div>
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    rating >= 4 
                      ? 'bg-green-500' 
                      : rating === 3 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          ℹ️ Feedback is anonymous. Individual comments are visible only to administrators.
        </p>
      </div>
    </div>
  );
}
