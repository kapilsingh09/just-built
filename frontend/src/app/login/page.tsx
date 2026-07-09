'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';

import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
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
      const loginRes = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      const accessToken = loginRes.data.accessToken;

      const userRes = await axiosInstance.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setAuth(userRes.data.user, accessToken);

      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-6 py-20">

      {/* Background Blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-20 h-72 w-72 rounded-full bg-orange-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-600/10 blur-[180px]" />
      </div>

      <div className="relative w-full max-w-md">

        <div className="rounded-3xl border border-white/10 bg-[#161616]/90 backdrop-blur-xl p-8 shadow-2xl">

          {/* Logo */}

          <div className="flex justify-center mb-8">

            <div className="flex items-center gap-3">

              <div className="h-12 w-12 rounded-xl bg-[#F47521] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/30">
                A
              </div>

              <div>
                <h1 className="text-2xl font-black text-white">
                  Ani
                  <span className="text-[#F47521]">
                    Verse
                  </span>
                </h1>

                <p className="text-xs text-gray-400">
                  Stream Your Favorite Anime
                </p>
              </div>

            </div>

          </div>

          <div className="mb-8 text-center">

            <h2 className="text-3xl font-bold text-white">
              Welcome Back
            </h2>

            <p className="mt-2 text-gray-400">
              Login to continue watching anime
            </p>

          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email
              </label>

              <div className="relative">

                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#1D1D1D]
                  py-3
                  pl-12
                  pr-4
                  text-white
                  placeholder:text-gray-500
                  outline-none
                  transition
                  focus:border-[#F47521]
                  focus:ring-2
                  focus:ring-[#F47521]/30
                "
                />

              </div>

            </div>

            {/* Password */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#1D1D1D]
                  py-3
                  pl-12
                  pr-4
                  text-white
                  placeholder:text-gray-500
                  outline-none
                  transition
                  focus:border-[#F47521]
                  focus:ring-2
                  focus:ring-[#F47521]/30
                "
                />

              </div>

            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#F47521]
              py-3
              font-semibold
              text-white
              transition
              hover:scale-[1.02]
              hover:bg-orange-500
              disabled:opacity-60
            "
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center text-sm text-gray-400">

              Don't have an account?

              <Link
                href="/register"
                className="ml-2 font-semibold text-[#F47521] hover:text-orange-400"
              >
                Create Account
              </Link>

            </div>

          </form>

        </div>

      </div>

    </section>
  );
}