'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { axiosInstance } from '@/lib/axios';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, setAuth } = useAuthStore();
  const router = useRouter();
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleRefreshProfile = async () => {
    try {
      setFetching(true);
      const res = await axiosInstance.get('/auth/me');
      // Update just the user data without overriding token (we don't get token from /me)
      useAuthStore.setState({ user: res.data.user });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setFetching(false);
    }
  };

  // If still loading initial auth state or redirecting
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-10">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl ring-1 ring-gray-900/5 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-4xl font-bold text-gray-300 uppercase shadow-lg">
              {user.username.charAt(0)}
            </div>
            <button 
              onClick={handleRefreshProfile}
              disabled={fetching}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {fetching ? 'Refreshing...' : 'Refresh Profile'}
            </button>
          </div>
          
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">User ID</p>
              <p className="font-mono text-xs">{user._id}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Member Since</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
