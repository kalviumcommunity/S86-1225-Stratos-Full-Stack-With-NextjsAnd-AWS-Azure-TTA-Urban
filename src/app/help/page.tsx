'use client';

import Link from 'next/link';
import { FiArrowLeft, FiHelpCircle, FiMessageSquare, FiMail, FiPhone } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

export default function HelpCenter() {
  const { theme, toggleTheme } = useTheme();

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I register on TTA-Urban?',
          a: 'Click on the "Get Started" button on the homepage, choose "Sign Up", fill in your details including name, email, and password, and verify your email address.',
        },
        {
          q: 'What types of complaints can I submit?',
          a: 'You can submit complaints related to Road & Infrastructure, Water Supply, Electricity, Garbage Collection, Street Lighting, Drainage, and other civic issues.',
        },
        {
          q: 'Is there a mobile app available?',
          a: 'Currently, TTA-Urban is accessible through web browsers on all devices. A dedicated mobile app is under development.',
        },
      ],
    },
    {
      category: 'Submitting Complaints',
      questions: [
        {
          q: 'How do I file a complaint?',
          a: 'Log in to your account, click on "New Complaint", fill in the complaint details, add location and images, and submit. You will receive a unique complaint ID for tracking.',
        },
        {
          q: 'Can I attach images to my complaint?',
          a: 'Yes, you can attach up to 5 images to help illustrate your complaint. Supported formats include JPG, PNG, and WEBP.',
        },
        {
          q: 'How do I track my complaint status?',
          a: 'Go to your dashboard to view all your complaints. Click on any complaint to see its current status, assigned officer, and resolution timeline.',
        },
      ],
    },
    {
      category: 'Account & Privacy',
      questions: [
        {
          q: 'How is my data protected?',
          a: 'We use industry-standard encryption and security measures to protect your data. Your personal information is never shared with third parties without your consent.',
        },
        {
          q: 'Can I update my profile information?',
          a: 'Yes, go to your Profile section from the dashboard to update your name, phone number, and password.',
        },
        {
          q: 'How do I reset my password?',
          a: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email.',
        },
      ],
    },
    {
      category: 'Notifications & Updates',
      questions: [
        {
          q: 'How will I know when my complaint is resolved?',
          a: 'You will receive notifications when your complaint status changes. You can also check the status anytime from your dashboard.',
        },
        {
          q: 'Can I disable notifications?',
          a: 'Notification preferences can be managed from your Profile settings.',
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help Center</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find answers to your questions</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Chat with our support team</p>
            <button className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline">
              Start Chat
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get help via email</p>
            <a href="mailto:support@tta-urban.gov" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
              support@tta-urban.gov
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Call our helpline</p>
            <a href="tel:1800-XXX-XXXX" className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
              1800-XXX-XXXX
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="flex items-center gap-3 mb-8">
            <FiHelpCircle className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-8">
            {faqs.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{section.category}</h3>
                <div className="space-y-4">
                  {section.questions.map((item, qIdx) => (
                    <div key={qIdx} className="border-l-4 border-teal-500 pl-4 py-2">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{item.q}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg shadow p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="mb-6">Can't find what you're looking for? Our support team is here to help.</p>
          <Link
            href="/login"
            className="inline-block bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </main>
    </div>
  );
}
