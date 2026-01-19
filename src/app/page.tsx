'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiMapPin, FiBell, FiBarChart2, FiUsers, FiClock, FiMessageCircle, FiCheckCircle, FiEye, FiTarget, FiShield, FiArrowRight } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

export default function Home() {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    avgResolutionTime: 0,
  });
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((data) => setStats(data.stats))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TTA-Urban</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
                How It Works
              </Link>
              <Link href="#about" className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
                About
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
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
              <Link href="/login" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Empowering Citizens, Transforming Cities
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Your Voice for a <span className="text-teal-600 dark:text-teal-400">Better Urban</span> Tomorrow
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                TTA-Urban bridges the gap between citizens and local bodies. Report issues, track progress, and hold authorities accountable—all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Report an Issue
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 text-lg font-semibold rounded-lg transition-all border-2 border-gray-200"
                >
                  Learn More
                </Link>
              </div>
              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-teal-500" />
                  <span>100% Transparent</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-teal-500" />
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-teal-500" />
                  <span>Verified Resolution</span>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="space-y-4">
              <div className="bg-orange-500 text-white rounded-2xl p-4 ml-auto w-48 text-center shadow-xl">
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-sm">Issues Resolved</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiEye className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Transparency</h3>
                    <p className="text-gray-600 text-sm">Every complaint is visible and trackable by the public</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiTarget className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Traceability</h3>
                    <p className="text-gray-600 text-sm">Complete audit trail from submission to resolution</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiShield className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Accountability</h3>
                    <p className="text-gray-600 text-sm">Transparent governance and SLA tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm uppercase tracking-wider mb-3">FEATURES</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to <span className="text-teal-600 dark:text-teal-400">Make a Difference</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform provides comprehensive tools for citizens to report, track, and resolve urban issues effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-6">
                <FiMapPin className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Geo-tagged Complaints</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pin your issue on the map for precise location tracking and faster resolution.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-6">
                <FiBell className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-time Notifications</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stay updated with instant alerts on your complaint status changes.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-6">
                <FiBarChart2 className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Analytics Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View city-wide statistics and track resolution rates by department.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-6">
                <FiUsers className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Community Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upvote issues that matter to you and unite for faster action.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-6">
                <FiShield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Data Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is protected with enterprise-grade security and privacy measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm uppercase tracking-wider mb-3">HOW IT WORKS</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple Steps to <span className="text-teal-600 dark:text-teal-400">Drive Change</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From reporting an issue to seeing it resolved—here's how TTA-Urban makes civic engagement effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  01
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submit Your Complaint</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Describe the issue, add photos, and pin the location on the map. It takes just 2 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  02
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get a unique tracking ID and monitor every stage of your complaint in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  03
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Resolution & Verification</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Officials address your issue and you verify the resolution with before/after photos.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  04
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rate & Review</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your experience and help improve services for everyone in your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
              <FiUsers className="w-4 h-4" />
              Join 10,000+ Active Citizens
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your City?
          </h2>
          <p className="text-xl text-teal-50 mb-10 max-w-2xl mx-auto">
            Be part of the movement that's making urban governance transparent, traceable, and accountable. Your voice matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-xl"
            >
              Get Started Free
              <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-all"
            >
              Track a Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-sm font-semibold mb-4">
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Building Better Cities Together
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              TTA-Urban is a revolutionary platform designed to bridge the gap between citizens and urban governance, making cities more responsive, transparent, and livable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                We believe that every citizen deserves a voice in shaping their city. TTA-Urban empowers communities to report civic issues, track their resolution, and hold authorities accountable through cutting-edge technology and transparent processes.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Our platform leverages blockchain technology, AI-powered analytics, and real-time tracking to ensure that no complaint goes unnoticed and every resolution is verified.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Transparent</span>
                </div>
                <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Accountable</span>
                </div>
                <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Efficient</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 text-white">
              <h4 className="text-2xl font-bold mb-6">Impact So Far</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-4xl font-bold mb-2">10,000+</div>
                  <div className="text-teal-100">Active Citizens</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">25,000+</div>
                  <div className="text-teal-100">Issues Resolved</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">50+</div>
                  <div className="text-teal-100">Cities Covered</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">4.8/5</div>
                  <div className="text-teal-100">Average Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Secure & Private</h4>
                <p className="text-gray-600 dark:text-gray-300">Your data is encrypted and protected with industry-leading security standards.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Fast Response</h4>
                <p className="text-gray-600 dark:text-gray-300">AI-powered routing ensures your complaint reaches the right department instantly.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community Driven</h4>
                <p className="text-gray-600 dark:text-gray-300">Join thousands of citizens working together to build better communities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">O</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">TTA-Urban</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Empowering citizens to build better cities through transparent, traceable, and accountable governance.
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                  >
                    Home
                  </a>
                </li>
                <li><Link href="#features" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">How It Works</Link></li>
                <li><Link href="#about" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/help" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/faq" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@tta-urban.gov
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  1800-XXX-XXXX (Toll Free)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Urban Development Authority, City Hall, Main Street
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">&copy; 2024 TTA-Urban. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
