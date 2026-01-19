'use client';

import Link from 'next/link';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

export default function PrivacyPolicy() {
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
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
            <FiShield className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Privacy Matters</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h3>
              <p>
                TTA-Urban ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our grievance management platform.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h3>
              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Personal Information:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Account credentials (encrypted passwords)</li>
                <li>Profile information and preferences</li>
              </ul>

              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Complaint Information:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Complaint details, descriptions, and categories</li>
                <li>Location data and addresses</li>
                <li>Photos and attachments you upload</li>
                <li>Communication history and status updates</li>
              </ul>

              <h4 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Technical Information:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and manage your complaints</li>
                <li>Communicate with you about complaint status</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Send important notifications and updates</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Information Sharing</h3>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Government Officials:</strong> Assigned officers and relevant departments to resolve your complaints</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Service Providers:</strong> Third-party vendors who assist in platform operations (under strict confidentiality agreements)</li>
              </ul>
              <p className="mt-3">
                We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Data Security</h3>
              <p>We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Secure backup and disaster recovery procedures</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and review your personal information</li>
                <li>Update or correct inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of non-essential communications</li>
                <li>Download your complaint history</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Data Retention</h3>
              <p>
                We retain your information for as long as necessary to provide services and comply with legal obligations. Complaint records are archived according to government record-keeping requirements.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Cookies and Tracking</h3>
              <p>
                We use cookies and similar technologies to enhance your experience. You can manage cookie preferences through your browser settings. See our <Link href="/cookies" className="text-teal-600 dark:text-teal-400 hover:underline">Cookie Policy</Link> for details.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Children's Privacy</h3>
              <p>
                Our platform is not intended for children under 13. We do not knowingly collect information from children.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notifications.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Contact Us</h3>
              <p>For privacy-related questions or concerns, contact us at:</p>
              <ul className="list-none space-y-2 mt-3">
                <li><strong>Email:</strong> privacy@tta-urban.gov</li>
                <li><strong>Phone:</strong> 1800-XXX-XXXX</li>
                <li><strong>Address:</strong> Urban Development Authority, City Hall, Main Street</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
