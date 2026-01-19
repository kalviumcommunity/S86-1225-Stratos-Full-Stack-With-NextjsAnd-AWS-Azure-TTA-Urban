'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      
      console.log('Auth callback - User role:', userRole);

      // Redirect based on role
      if (userRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (userRole === 'OFFICER') {
        router.push('/officer/dashboard');
      } else if (userRole === 'CITIZEN') {
        router.push('/complaints');
      } else {
        router.push('/complaints'); // Default fallback
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Signing you in...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we redirect you to your dashboard
        </p>
      </div>
    </div>
  );
}
