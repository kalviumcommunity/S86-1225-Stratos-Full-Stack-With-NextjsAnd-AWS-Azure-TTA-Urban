'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiMail, FiSun, FiMoon, FiCheckCircle } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 to-cyan-600 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">O</span>
            </div>
            <span className="text-2xl font-bold text-white">TTA-Urban</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Reset Your Password
          </h1>
          
          <p className="text-teal-50 text-lg mb-12">
            Don't worry! It happens. Enter your email and we'll send you instructions to reset your password.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span>Quick and secure process</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span>Email verification required</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span>Access restored in minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Back to Login and Theme Toggle */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Check Your Email</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                We've sent password reset instructions to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all text-center"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg transition-all"
                >
                  Resend Email
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  No worries, we'll send you reset instructions
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                  >
                    Remember your password? Sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
