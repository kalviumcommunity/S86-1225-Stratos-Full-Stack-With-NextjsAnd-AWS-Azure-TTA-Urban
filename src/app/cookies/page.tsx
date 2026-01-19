'use client';

import Link from 'next/link';
import { FiArrowLeft, FiSettings } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

export default function CookiePolicy() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cookie Policy</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: January 12, 2026</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="flex items-center gap-3 mb-8">
            <FiSettings className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How We Use Cookies</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. What Are Cookies?</h3>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and provide a better user experience.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Types of Cookies We Use</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Essential Cookies (Required)</h4>
                  <p className="text-sm">
                    These cookies are necessary for the Platform to function properly. They enable core features like security, authentication, and access to secure areas.
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                    <li>Session management</li>
                    <li>Authentication tokens</li>
                    <li>Security and fraud prevention</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Functional Cookies (Optional)</h4>
                  <p className="text-sm">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                    <li>Language preferences</li>
                    <li>Theme settings (dark/light mode)</li>
                    <li>User interface preferences</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics Cookies (Optional)</h4>
                  <p className="text-sm">
                    These cookies help us understand how visitors interact with the Platform by collecting and reporting information anonymously.
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                    <li>Page views and traffic sources</li>
                    <li>User navigation patterns</li>
                    <li>Feature usage statistics</li>
                    <li>Performance metrics</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Cookies (Optional)</h4>
                  <p className="text-sm">
                    These cookies help us improve Platform performance by understanding how it's being used.
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                    <li>Page load times</li>
                    <li>Error tracking</li>
                    <li>Server response times</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Third-Party Cookies</h3>
              <p>We may use third-party services that set their own cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Analytics:</strong> For website analytics and reporting</li>
                <li><strong>Authentication Providers:</strong> For OAuth login services (e.g., Google Sign-In)</li>
                <li><strong>Content Delivery Networks (CDN):</strong> For faster content delivery</li>
              </ul>
              <p className="mt-3">
                These third parties have their own privacy policies governing their use of cookies.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Cookie Duration</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Session Cookies:</h4>
                  <p className="text-sm">Temporary cookies that are deleted when you close your browser.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Persistent Cookies:</h4>
                  <p className="text-sm">Cookies that remain on your device for a set period (typically 30 days to 1 year) or until you delete them.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Managing Cookies</h3>
              <p>You have several options to manage cookies:</p>
              
              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Browser Settings:</h4>
              <p>Most browsers allow you to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>View and delete cookies</li>
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Clear cookies when you close the browser</li>
              </ul>

              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Browser-Specific Instructions:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>

              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  <strong>Note:</strong> Blocking or deleting essential cookies may affect Platform functionality. Some features may not work properly without cookies.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Do Not Track</h3>
              <p>
                Some browsers have a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no standard for how DNT signals should be interpreted. We honor DNT signals where technically feasible.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Updates to This Policy</h3>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. The "Last Updated" date at the top indicates when this policy was last revised.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. More Information</h3>
              <p>
                For more details about how we protect your privacy, please see our <Link href="/privacy" className="text-teal-600 dark:text-teal-400 hover:underline">Privacy Policy</Link>.
              </p>
              <p className="mt-3">
                If you have questions about our use of cookies, contact us at:
              </p>
              <ul className="list-none space-y-2 mt-3">
                <li><strong>Email:</strong> privacy@tta-urban.gov</li>
                <li><strong>Phone:</strong> 1800-XXX-XXXX</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <p className="text-sm text-teal-900 dark:text-teal-100">
                By continuing to use TTA-Urban, you consent to our use of cookies as described in this policy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
