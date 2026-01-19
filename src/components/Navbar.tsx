'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FiHome, FiFileText, FiUser, FiLogOut, FiBell, FiStar } from 'react-icons/fi';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'CITIZEN':
        return [
          { href: '/complaints', label: 'My Complaints', icon: FiFileText },
          { href: '/complaints/new', label: 'New Complaint', icon: FiHome },
          { href: '/profile', label: 'Profile', icon: FiUser },
        ];
      case 'OFFICER':
        return [
          { href: '/officer/dashboard', label: 'Dashboard', icon: FiHome },
          { href: '/officer/profile', label: 'Profile', icon: FiUser },
        ];
      case 'ADMIN':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
          { href: '/admin/complaints', label: 'Complaints', icon: FiFileText },
          { href: '/admin/users', label: 'Users', icon: FiUser },
          { href: '/admin/feedback', label: 'Feedback', icon: FiStar },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TTA</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Urban Grievance</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              ))}

              <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <FiBell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
