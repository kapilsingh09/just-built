'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('karand');
  const [email, setEmail] = useState('karand005@mail.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/auth/register', { username, email, password });

      const { accessToken, user } = res.data;
      setAuth(user, accessToken);

      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl ring-1 ring-gray-900/5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Create an account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join NexusAuth today</p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="johndoe"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Your email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Already have an account? <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
