'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiEye, FiBell, FiUser, FiLogOut, FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import { useTheme } from '@/components/ThemeProvider';
import dynamic from 'next/dynamic';

// Dynamically import LocationMap to avoid SSR issues with Leaflet
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-teal-500"></div>
    </div>
  ),
});

const CATEGORIES = [
  'Road & Infrastructure',
  'Water Supply',
  'Electricity',
  'Garbage Collection',
  'Street Lighting',
  'Drainage',
  'Public Property Damage',
  'Noise Pollution',
  'Air Pollution',
  'Other',
];

export default function NewComplaintPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search address');
      }
      
      const data = await response.json();
      setAddressSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(Array.isArray(data) && data.length > 0);
    } catch (error) {
      console.error('Error searching address:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, address: value });
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length >= 3) {
      setIsSearching(true);
      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(value);
      }, 500);
    } else {
      setIsSearching(false);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectAddress = (suggestion: any) => {
    setFormData({
      ...formData,
      address: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    });
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setIsSearching(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages([...images, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleGetLocation = () => {
    setError('');
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsGettingLocation(false);
      return;
    }

    // Request location with high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        
        setFormData({
          ...formData,
          latitude: lat,
          longitude: lng,
        });

        // Optionally, reverse geocode to get address
        fetch(`/api/geocode?lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            if (data.display_name) {
              setFormData(prev => ({
                ...prev,
                address: data.display_name,
                latitude: lat,
                longitude: lng,
              }));
            }
          })
          .catch(() => {
            // Silently fail reverse geocoding, coordinates are already set
          })
          .finally(() => {
            setIsGettingLocation(false);
          });
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Unable to get your location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please enter address manually.';
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 30000
      }
    );
  };

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));

    // Reverse geocode to get address
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lon=${lng}`);
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          setFormData(prev => ({
            ...prev,
            address: data.display_name,
          }));
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages([...images, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('address', formData.address);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);

      // Append images
      images.forEach((image, index) => {
        submitData.append('images', image);
      });

      const response = await fetch('/api/complaints', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/complaints');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complaint Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your complaint has been successfully submitted. You will be redirected to your dashboard.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">File New Complaint</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fill in the details below to report an issue in your area
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Complaint Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Broken street light on Main Street"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Location
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={handleAddressChange}
                    onFocus={() => formData.address.length >= 3 && addressSuggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Enter address or landmark"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                    </div>
                  )}
                  
                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur event
                            selectAddress(suggestion);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-start gap-2">
                            <FiMapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {suggestion.display_name.split(',')[0]}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {suggestion.display_name}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium transition-all border border-teal-600 dark:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 dark:border-teal-400"></div>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <FiMapPin className="w-4 h-4" />
                        Use GPS
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium transition-all border border-teal-600 dark:border-teal-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {showMap ? 'Hide Map' : 'Pick on Map'}
                  </button>
                </div>

                {/* Interactive Map */}
                {showMap && (
                  <div className="mt-3">
                    <LocationMap
                      latitude={parseFloat(formData.latitude) || 17.385044}
                      longitude={parseFloat(formData.longitude) || 78.486671}
                      onLocationSelect={handleMapLocationSelect}
                      interactive={true}
                      height="400px"
                    />
                  </div>
                )}
                
                {formData.latitude && formData.longitude && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 Location: {formData.latitude}, {formData.longitude}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Upload Photos (Max 5)
              </label>
              <div className="space-y-4">
                {/* Upload and Camera Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Upload from Gallery */}
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                    <div className="flex flex-col items-center justify-center">
                      <FiUpload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload from Gallery</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select photos</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={images.length >= 5}
                    />
                  </label>

                  {/* Take Photo */}
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-teal-300 dark:border-teal-600 border-dashed rounded-lg cursor-pointer bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 mb-2 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Take Photo</p>
                      <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Use camera</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraCapture}
                      disabled={images.length >= 5}
                    />
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/complaints"
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
