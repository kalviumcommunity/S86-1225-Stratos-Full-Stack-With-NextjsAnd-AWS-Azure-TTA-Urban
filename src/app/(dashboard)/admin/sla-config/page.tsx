'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiClock } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

interface SLAConfig {
  category: string;
  hours: number;
}

const DEFAULT_SLA_CONFIG: SLAConfig[] = [
  { category: 'Road & Infrastructure', hours: 72 },
  { category: 'Water Supply', hours: 24 },
  { category: 'Electricity', hours: 12 },
  { category: 'Garbage Collection', hours: 48 },
  { category: 'Street Lighting', hours: 24 },
  { category: 'Drainage', hours: 48 },
  { category: 'Other', hours: 96 },
];

export default function SLAConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [slaConfig, setSlaConfig] = useState<SLAConfig[]>(DEFAULT_SLA_CONFIG);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/complaints');
    }
  }, [status, session, router]);

  useEffect(() => {
    // In a real application, fetch SLA config from backend
    // For now, using default values
    const stored = localStorage.getItem('slaConfig');
    if (stored) {
      setSlaConfig(JSON.parse(stored));
    }
  }, []);

  const handleHoursChange = (category: string, hours: number) => {
    setSlaConfig((prev) =>
      prev.map((item) =>
        item.category === category ? { ...item, hours: Math.max(1, hours) } : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real application, send to backend API
      // For now, storing in localStorage
      localStorage.setItem('slaConfig', JSON.stringify(slaConfig));
      
      setMessage('SLA configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving SLA configuration');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset to default values?')) {
      setSlaConfig(DEFAULT_SLA_CONFIG);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SLA Configuration</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Set Service Level Agreement (SLA) deadlines for each category
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <FiClock className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Category SLA Hours</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure the number of hours allowed for each complaint category to be resolved.
              Officers will be notified when approaching deadlines.
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {slaConfig.map((config) => (
                <div
                  key={config.category}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{config.category}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Expected resolution time: {config.hours} hours ({(config.hours / 24).toFixed(1)} days)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      value={config.hours}
                      onChange={(e) => handleHoursChange(config.category, parseInt(e.target.value) || 1)}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">hours</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={resetToDefaults}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Reset to Default Values
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How SLA Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• SLA deadline is calculated from complaint submission time</li>
            <li>• Officers receive notifications when complaints approach deadline</li>
            <li>• Breached SLAs are highlighted in red on dashboards</li>
            <li>• Admin can track SLA performance in analytics</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

