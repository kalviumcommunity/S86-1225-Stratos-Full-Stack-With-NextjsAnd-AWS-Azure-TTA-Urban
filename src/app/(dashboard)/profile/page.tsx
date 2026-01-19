'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit, FiLogOut, FiCrosshair } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const addressTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Update session with new name
      if (update) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
          },
        });
      }
      
      // Refresh profile data
      await fetchProfile();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setError((error as Error).message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/api/auth/logout';
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `/api/geocode?lat=${latitude}&lon=${longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({ ...prev, address: data.display_name || '' }));
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setError('Failed to get address from location');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your location. Please enable location services.');
        setIsLoadingLocation(false);
      },
      { timeout: 5000 }
    );
  };

  // Search address with debounce
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  }, []);

  const handleAddressChange = (value: string) => {
    setFormData(prev => ({ ...prev, address: value }));
    
    // Debounce search
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    addressTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  const selectAddress = (suggestion: any) => {
    setFormData(prev => ({ ...prev, address: suggestion.display_name }));
    setAddressSuggestions([]);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/complaints"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <FiUser className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account information</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium transition-all"
              >
                <FiEdit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                  <FiMapPin className="w-5 h-5 text-gray-400" />
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="absolute top-3 right-3 p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all disabled:opacity-50"
                    title="Use current location"
                  >
                    {isLoadingLocation ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                    ) : (
                      <FiCrosshair className="w-5 h-5" />
                    )}
                  </button>
                )}
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Enter address or use GPS..." : ""}
                  className="w-full pl-10 pr-14 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed resize-none"
                />
                
                {/* Address Suggestions */}
                {isEditing && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAddress(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-start gap-2">
                          <FiMapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {suggestion.display_name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Logout Section */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
