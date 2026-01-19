'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { FiArrowLeft, FiSun, FiMoon, FiCheckCircle } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

const SAVED_EMAILS_KEY = 'tta_urban_saved_emails';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load saved emails from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SAVED_EMAILS_KEY);
    if (stored) {
      try {
        const emails = JSON.parse(stored);
        setSavedEmails(Array.isArray(emails) ? emails : []);
      } catch (e) {
        console.error('Error parsing saved emails:', e);
      }
    }
  }, []);

  // Filter emails based on input
  useEffect(() => {
    if (formData.email && savedEmails.length > 0) {
      const filtered = savedEmails.filter(email =>
        email.toLowerCase().includes(formData.email.toLowerCase())
      );
      setFilteredEmails(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredEmails([]);
      setShowSuggestions(false);
    }
  }, [formData.email, savedEmails]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        emailInputRef.current &&
        !emailInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveEmailToLocalStorage = (email: string) => {
    const stored = localStorage.getItem(SAVED_EMAILS_KEY);
    let emails: string[] = [];
    
    if (stored) {
      try {
        emails = JSON.parse(stored);
      } catch (e) {
        emails = [];
      }
    }

    // Add email if it doesn't exist, keep max 5 emails
    if (!emails.includes(email)) {
      emails.unshift(email);
      if (emails.length > 5) {
        emails = emails.slice(0, 5);
      }
      localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(emails));
      setSavedEmails(emails);
    }
  };

  const handleEmailSelect = (email: string) => {
    setFormData({ ...formData, email });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Save email to localStorage on successful login
        saveEmailToLocalStorage(formData.email);
        
        // Wait a bit for the session to be properly set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch user session to check role
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        console.log('Session after login:', session);
        
        // Redirect based on role
        const userRole = session?.user?.role;
        if (userRole === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (userRole === 'OFFICER') {
          router.push('/officer/dashboard');
        } else if (userRole === 'CITIZEN') {
          router.push('/complaints');
        } else {
          router.push('/complaints'); // Default to citizen dashboard
        }
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
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
            Your Voice for a Better Urban Tomorrow
          </h1>
          
          <p className="text-teal-50 text-lg mb-12">
            Join thousands of citizens making their cities better through transparent and accountable governance.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span>Report issues in seconds</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span>Track progress in real-time</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span>Hold officials accountable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Back to Home and Theme Toggle */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              suppressHydrationWarning
            >
              {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue to your dashboard</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md font-medium transition-all" suppressHydrationWarning>
              Sign In
            </button>
            <Link
              href="/register"
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md font-medium text-center transition-all"
            >
              Sign Up
            </Link>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  suppressHydrationWarning
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              suppressHydrationWarning
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">OR CONTINUE WITH</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await signIn('google', { 
                    callbackUrl: '/callback',
                    redirect: true,
                  });
                } catch (error) {
                  console.error('Google sign-in error:', error);
                  setError('Failed to sign in with Google. Please try again.');
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all bg-white dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1818182,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Continue with Google</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
