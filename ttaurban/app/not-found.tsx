import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Oops! The route you&apos;re looking for doesn&apos;t exist. It might
          have been moved or deleted.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 transition"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </main>
  );
}
