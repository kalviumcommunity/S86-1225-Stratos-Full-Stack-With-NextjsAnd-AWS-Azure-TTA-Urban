/**
 * Loading Skeleton for Contact Page
 * Shows while contact form is being initialized
 */
export default function Loading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-6 sm:mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
        </div>

        {/* Contact Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md dark:shadow-gray-900/50 animate-pulse"
            >
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
          ))}
        </div>

        {/* Form Skeleton */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/50 animate-pulse">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Submit Button Skeleton */}
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}
