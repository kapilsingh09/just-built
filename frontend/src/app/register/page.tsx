'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

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
    <section className="min-h-screen bg-zinc-900 flex items-center justify-center px-6 py-20">

      <div className="relative w-full max-w-md">

        <div className="rounded-2xl border border-white/10 bg-zinc-800/80 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#F47521] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/30">
                A
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">
                  Ani
                  <span className="text-[#F47521]">Verse</span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Stream Your Favorite Anime
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white">
              Create Account
            </h2>
            <p className="mt-2 text-zinc-400">
              Join AniVerse today
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                  className="
                    w-full rounded-xl border border-white/10 bg-zinc-900
                    py-3 pl-12 pr-4 text-white placeholder:text-zinc-500
                    outline-none transition
                    focus:border-white/30 focus:ring-2 focus:ring-white/10
                  "
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="
                    w-full rounded-xl border border-white/10 bg-zinc-900
                    py-3 pl-12 pr-4 text-white placeholder:text-zinc-500
                    outline-none transition
                    focus:border-white/30 focus:ring-2 focus:ring-white/10
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="
                    w-full rounded-xl border border-white/10 bg-zinc-900
                    py-3 pl-12 pr-4 text-white placeholder:text-zinc-500
                    outline-none transition
                    focus:border-white/30 focus:ring-2 focus:ring-white/10
                  "
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                flex w-full items-center justify-center gap-2
                rounded-xl border border-white/20 bg-white/10
                backdrop-blur-md py-3 font-semibold text-white
                transition-all duration-300
                hover:bg-white/15 hover:border-white/30
                active:scale-[0.98] disabled:opacity-60
                cursor-pointer
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center text-sm text-zinc-400">
              Already have an account?
              <Link
                href="/login"
                className="ml-2 font-semibold text-white hover:text-zinc-300 transition-colors"
              >
                Sign In
              </Link>
            </div>

          </form>

        </div>

      </div>

    </section>
  );
}
