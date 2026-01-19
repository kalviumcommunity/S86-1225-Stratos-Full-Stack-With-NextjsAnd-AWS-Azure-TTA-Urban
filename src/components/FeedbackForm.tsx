'use client';

import { useState } from 'react';

interface FeedbackFormProps {
  complaintId: string;
  onSuccess?: () => void;
}

export default function FeedbackForm({ complaintId, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.length > 300) {
      setError('Comment cannot exceed 300 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/complaints/${complaintId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Thank You for Your Feedback!</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your feedback has been submitted successfully. This complaint is now closed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Rate Your Experience
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Your feedback is anonymous to the officer and helps us improve our services.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <svg
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
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
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {rating === 1 && 'Very Dissatisfied'}
              {rating === 2 && 'Dissatisfied'}
              {rating === 3 && 'Neutral'}
              {rating === 4 && 'Satisfied'}
              {rating === 5 && 'Very Satisfied'}
            </p>
          )}
        </div>

        {/* Comment (Optional) */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Feedback Comment <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={300}
            rows={4}
            placeholder="Share your experience... (e.g., 'Road was fixed within 2 days. Good response.')"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500
                     resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {comment.length}/300 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                   text-white font-semibold py-3 px-6 rounded-lg
                   transition-colors duration-200
                   disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          ⚠️ Once submitted, feedback cannot be edited or deleted
        </p>
      </form>
    </div>
  );
}
