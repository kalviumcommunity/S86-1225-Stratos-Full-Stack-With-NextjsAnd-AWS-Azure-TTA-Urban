import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🏙️ Welcome to TTA-Urban
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Transparency, Traceability & Accountability in Urban Governance
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-3">✔️</div>
            <h3 className="text-lg font-semibold mb-2">Transparency</h3>
            <p className="text-gray-600 text-sm">
              Real-time status updates and public dashboards
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Traceability</h3>
            <p className="text-gray-600 text-sm">
              Complete complaint lifecycle with timestamps
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2">Accountability</h3>
            <p className="text-gray-600 text-sm">
              Role-based access and SLA-based escalations
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 transition"
          >
            View Dashboard
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-12 text-gray-600">
          <p className="text-sm">
            Navigate to{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">/login</code> to
            sign in or{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">/dashboard</code>{" "}
            after authentication.
          </p>
        </div>
      </div>
    </main>
  );
}
