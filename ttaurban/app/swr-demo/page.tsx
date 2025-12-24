"use client";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export default function CacheDemoPage() {
  const [userId, setUserId] = useState<number | null>(1);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const { cache, mutate } = useSWRConfig();

  // Fetch user data with SWR
  const { data, error, isLoading } = useSWR(
    userId ? `/api/users/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  // Update cache keys list
  const showCacheKeys = () => {
    const keys: string[] = [];
    // @ts-ignore - cache is a Map
    for (const key of cache.keys()) {
      keys.push(key);
    }
    setCacheKeys(keys);
  };

  // Clear all cache
  const clearCache = () => {
    // @ts-ignore
    cache.clear();
    setCacheKeys([]);
  };

  // Manual revalidation
  const manualRevalidate = () => {
    mutate(`/api/users/${userId}`);
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        SWR Cache Demonstration
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Data Fetching */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">
            🔍 Fetch User Data
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User ID:
              </label>
              <select
                value={userId || ""}
                onChange={(e) => setUserId(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">None</option>
                <option value="1">User 1</option>
                <option value="2">User 2</option>
                <option value="3">User 3</option>
                <option value="4">User 4</option>
                <option value="5">User 5</option>
              </select>
            </div>

            {isLoading && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-700">⏳ Loading user data...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700">❌ Error: {error.message}</p>
              </div>
            )}

            {data && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-900 font-semibold mb-2">
                  ✅ User Data (Cached):
                </p>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={manualRevalidate}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                🔄 Revalidate
              </button>
              <button
                onClick={() => setUserId(userId === 5 ? 1 : (userId || 0) + 1)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ➡️ Next User
              </button>
            </div>
          </div>
        </div>

        {/* Cache Inspector */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">
            🗂️ Cache Inspector
          </h2>

          <div className="space-y-4">
            <button
              onClick={showCacheKeys}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              📊 Show Cache Keys
            </button>

            <div className="bg-gray-50 p-4 rounded border border-gray-200 min-h-[200px]">
              <p className="font-semibold text-gray-700 mb-2">
                Cached Keys ({cacheKeys.length}):
              </p>
              {cacheKeys.length === 0 ? (
                <p className="text-gray-500 italic">
                  No cache keys found. Click &quot;Show Cache Keys&quot; to
                  inspect.
                </p>
              ) : (
                <ul className="space-y-1">
                  {cacheKeys.map((key, index) => (
                    <li
                      key={index}
                      className="text-sm font-mono text-gray-700 bg-white p-2 rounded border border-gray-200"
                    >
                      {key}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={clearCache}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              🗑️ Clear All Cache
            </button>
          </div>
        </div>
      </div>

      {/* Cache Behavior Explanation */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h2 className="text-xl font-semibold mb-4 text-indigo-900">
          📚 How SWR Cache Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-indigo-700 mb-2">
              Cache Hit (Fast) ⚡
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Data exists in cache</li>
              <li>✅ Return cached data immediately</li>
              <li>✅ Revalidate in background</li>
              <li>✅ Update UI if data changed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-indigo-700 mb-2">
              Cache Miss (Slower) 🐌
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>❌ No cached data available</li>
              <li>⏳ Show loading state</li>
              <li>📡 Fetch from API</li>
              <li>💾 Store in cache for next time</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded border border-indigo-200">
          <h3 className="font-semibold text-indigo-700 mb-2">
            🔄 Revalidation Strategies
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-indigo-200">
                <th className="text-left py-2 text-indigo-900">Strategy</th>
                <th className="text-left py-2 text-indigo-900">Trigger</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-200">
                <td className="py-2">On Focus</td>
                <td className="py-2">Tab regains focus</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2">On Reconnect</td>
                <td className="py-2">Network reconnects</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2">Interval</td>
                <td className="py-2">Every N milliseconds</td>
              </tr>
              <tr>
                <td className="py-2">Manual</td>
                <td className="py-2">mutate() called</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Testing Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-3">
          🧪 Test Cache Behavior:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
          <li>Select a user and observe the loading state</li>
          <li>Click &quot;Show Cache Keys&quot; to see the cached endpoint</li>
          <li>Switch to another user — notice instant loading from cache</li>
          <li>
            Switch back to the first user — data loads instantly (cache hit!)
          </li>
          <li>Click &quot;Revalidate&quot; to manually refresh data</li>
          <li>Switch tabs and come back — SWR revalidates automatically</li>
          <li>Clear cache and observe the loading state reappear</li>
        </ol>
      </div>

      {/* Console Monitoring */}
      <div className="mt-6 bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm">
        <p className="mb-2">💻 Console Output (open DevTools):</p>
        <pre className="text-xs">
          {`✅ SWR Success: { key: "/api/users/1", dataSize: 245 }
🔄 Manual revalidation triggered
🗑️ Cache cleared`}
        </pre>
      </div>
    </main>
  );
}
