'use client';

import Link from 'next/link';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

export default function TermsOfService() {
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
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
            <FiFileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Terms and Conditions</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h3>
              <p>
                By accessing and using TTA-Urban ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Description of Service</h3>
              <p>
                TTA-Urban is a digital grievance management platform that enables citizens to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Submit and track civic complaints</li>
                <li>Communicate with government officials</li>
                <li>Monitor complaint resolution progress</li>
                <li>Access public services and information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. User Accounts</h3>
              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Registration:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>One person may only create one account</li>
              </ul>

              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Account Security:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep your password confidential</li>
                <li>Notify us immediately of unauthorized access</li>
                <li>You are responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. User Conduct</h3>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Submit false, misleading, or fraudulent complaints</li>
                <li>Use offensive, abusive, or threatening language</li>
                <li>Upload inappropriate, illegal, or copyrighted content</li>
                <li>Spam, harass, or impersonate other users</li>
                <li>Attempt to hack, disrupt, or compromise the Platform</li>
                <li>Use automated bots or scrapers</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Complaint Submission</h3>
              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Guidelines:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Complaints must be genuine civic issues</li>
                <li>Provide accurate location and description</li>
                <li>Include relevant photos or evidence</li>
                <li>One complaint per issue (no duplicates)</li>
              </ul>

              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Processing:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not guarantee resolution timelines</li>
                <li>Complaints may be rejected if they violate policies</li>
                <li>Resolution depends on department resources and priorities</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Intellectual Property</h3>
              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Platform Content:</h4>
              <p>
                All Platform content, including design, text, graphics, and software, is owned by TTA-Urban or its licensors and protected by copyright laws.
              </p>

              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">User Content:</h4>
              <p>
                By submitting content (complaints, photos, comments), you grant us a license to use, display, and share this content for Platform operations and public transparency purposes.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Privacy</h3>
              <p>
                Your use of the Platform is also governed by our <Link href="/privacy" className="text-teal-600 dark:text-teal-400 hover:underline">Privacy Policy</Link>. We collect and use your information as described in that policy.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Disclaimers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Platform is provided "as is" without warranties</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We are not responsible for complaint resolution delays</li>
                <li>Third-party links are provided for convenience only</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, TTA-Urban shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Account Termination</h3>
              <p>We reserve the right to suspend or terminate your account if you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Repeatedly submit false complaints</li>
                <li>Abuse or harass Platform users or staff</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Modifications to Terms</h3>
              <p>
                We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the revised Terms. We will notify you of significant changes.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Governing Law</h3>
              <p>
                These Terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13. Contact Information</h3>
              <p>For questions about these Terms, contact us at:</p>
              <ul className="list-none space-y-2 mt-3">
                <li><strong>Email:</strong> legal@tta-urban.gov</li>
                <li><strong>Phone:</strong> 1800-XXX-XXXX</li>
                <li><strong>Address:</strong> Urban Development Authority, City Hall, Main Street</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <p className="text-sm text-teal-900 dark:text-teal-100">
                By using TTA-Urban, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
