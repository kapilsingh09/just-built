'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { axiosInstance } from '@/lib/axios';
import { LogOut, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 dark:border-gray-800">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NexusAuth
          </span>
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="flex items-center justify-center text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800 transition-all duration-300"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                {user?.username || 'Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center justify-center text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700 transition-all duration-300"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/30"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
