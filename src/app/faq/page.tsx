'use client';

import Link from 'next/link';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

export default function FAQ() {
  const { theme, toggleTheme } = useTheme();

  const categories = [
    {
      title: 'Account Management',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click "Get Started" on the homepage, select "Sign Up", fill in your details (name, email, password), and verify your email address.',
        },
        {
          question: 'I forgot my password. How do I reset it?',
          answer: 'Click "Forgot Password" on the login page, enter your registered email, and follow the reset instructions sent to your inbox.',
        },
        {
          question: 'Can I change my email address?',
          answer: 'Currently, email addresses cannot be changed. Please contact support if you need assistance with this.',
        },
        {
          question: 'How do I delete my account?',
          answer: 'Go to Profile > Settings > Account > Delete Account. Please note this action is irreversible and all your data will be permanently deleted.',
        },
      ],
    },
    {
      title: 'Filing Complaints',
      faqs: [
        {
          question: 'What types of complaints can I file?',
          answer: 'You can file complaints related to Road & Infrastructure, Water Supply, Electricity, Garbage Collection, Street Lighting, Drainage, and other civic issues.',
        },
        {
          question: 'How many photos can I attach?',
          answer: 'You can attach up to 5 photos per complaint. Supported formats are JPG, PNG, and WEBP with a maximum size of 5MB per image.',
        },
        {
          question: 'Do I need to provide my exact location?',
          answer: 'Yes, accurate location helps us route your complaint to the right department and ensures faster resolution.',
        },
        {
          question: 'Can I file anonymous complaints?',
          answer: 'No, you must be logged in to file a complaint. This ensures accountability and allows us to communicate updates with you.',
        },
        {
          question: 'What happens after I submit a complaint?',
          answer: 'You receive a unique complaint ID. Your complaint is reviewed and assigned to the appropriate department. You will receive status updates via notifications.',
        },
      ],
    },
    {
      title: 'Tracking & Status',
      faqs: [
        {
          question: 'How do I track my complaint?',
          answer: 'Login to your account and visit the Dashboard. All your complaints are listed with their current status. Click on any complaint to view detailed progress.',
        },
        {
          question: 'What do the different statuses mean?',
          answer: 'NEW: Just submitted. ASSIGNED: Assigned to an officer. IN_PROGRESS: Being worked on. RESOLVED: Completed. CLOSED: Finalized.',
        },
        {
          question: 'How long does it take to resolve a complaint?',
          answer: 'Resolution time varies by category and complexity. Most complaints are resolved within the SLA timeline displayed in your complaint details.',
        },
        {
          question: 'Will I be notified of status changes?',
          answer: 'Yes, you will receive notifications for all major status changes. You can also check anytime from your dashboard.',
        },
      ],
    },
    {
      title: 'Technical Issues',
      faqs: [
        {
          question: 'The website is not loading properly. What should I do?',
          answer: 'Try clearing your browser cache, using a different browser, or checking your internet connection. If the issue persists, contact support.',
        },
        {
          question: 'I cannot upload photos. What\'s wrong?',
          answer: 'Ensure your images are in JPG, PNG, or WEBP format and under 5MB. Check your internet connection. If the problem continues, try a different browser.',
        },
        {
          question: 'Is there a mobile app?',
          answer: 'Currently, TTA-Urban is accessible via web browsers on all devices. A dedicated mobile app is under development.',
        },
        {
          question: 'Which browsers are supported?',
          answer: 'TTA-Urban works best on the latest versions of Chrome, Firefox, Safari, and Edge.',
        },
      ],
    },
    {
      title: 'Privacy & Security',
      faqs: [
        {
          question: 'Is my personal information safe?',
          answer: 'Yes, we use industry-standard encryption and security measures. Your data is never shared without your consent. See our Privacy Policy for details.',
        },
        {
          question: 'Who can see my complaints?',
          answer: 'Your complaints are visible to you, assigned officers, and relevant government departments. Some complaint data may be anonymized for public statistics.',
        },
        {
          question: 'Can I make my complaint private?',
          answer: 'All complaints require basic transparency for accountability. However, your contact details are kept confidential and not publicly displayed.',
        },
      ],
    },
  ];

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find quick answers to common questions</p>
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
        <div className="space-y-8">
          {categories.map((category, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{category.title}</h2>
              <div className="space-y-6">
                {category.faqs.map((faq, faqIdx) => (
                  <div key={faqIdx} className="border-l-4 border-teal-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Still have questions?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <Link
                href="/help"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
