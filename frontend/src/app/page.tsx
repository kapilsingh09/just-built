'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from '@/lib/axios';
import { Star, Tv, Calendar, Tag, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Anime {
  id: number;
  title: string;
  synopsis: string;
  score: number;
  episodes: number;
  image: string;
  bannerImage: string;
  status: string;
  year: number;
  season: string;
  type: string;
  rating: string;
  genres: string[];
}

interface ApiResponse {
  success: boolean;
  source: 'cache' | 'api';
  meta: { year: number; season: string; count: number };
  data: Anime[];
}

// ─── AnimeCard ─────────────────────────────────────────────────────────────────
function AnimeCard({ anime }: { anime: Anime }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/40"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-800">
        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Tv size={48} />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Score badge */}
        {anime.score && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-full border border-yellow-500/30">
            <Star size={10} fill="currentColor" />
            {anime.score.toFixed(1)}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
          {anime.type}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-2">
            {anime.title}
          </h3>

          <div className="flex items-center gap-3 text-gray-400 text-xs">
            {anime.episodes && (
              <span className="flex items-center gap-1">
                <Tv size={10} />
                {anime.episodes} eps
              </span>
            )}
            {anime.year && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {anime.year}
              </span>
            )}
          </div>

          {/* Genres */}
          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {anime.genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hover tooltip — synopsis */}
      <div
        className={`absolute inset-0 bg-gray-900/95 backdrop-blur-sm p-4 flex flex-col justify-center transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{anime.title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-6">{anime.synopsis}</p>
        <div className="mt-3 flex items-center gap-2">
          <Tag size={10} className="text-purple-400" />
          <span className="text-purple-400 text-xs">{anime.rating}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  // TanStack Query handles: caching, deduplication, loading & error states.
  // queryKey: ['anime', 'popular'] — uniquely identifies this query in the cache.
  // staleTime from queryClient.ts: 5 min — no refetch while data is fresh.
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ['anime', 'popular'],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse>('/anime/popular');
      return res.data;
    },
  });

  const animeList = data?.data ?? [];
  const meta      = data?.meta ?? null;
  const source    = data?.source ?? null;

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 px-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-blue-700/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/40 text-purple-300 text-xs font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Powered by Jikan API + Redis Cache
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Trending Anime
            </span>
          </h1>

          {meta && (
            <p className="text-gray-400 text-lg md:text-xl mb-8">
              Top <span className="text-white font-semibold">{meta.count}</span> popular picks for{' '}
              <span className="text-purple-400 font-semibold capitalize">{meta.season} {meta.year}</span>
            </p>
          )}

          {/* Cache badge */}
          {source && (
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${
              source === 'cache'
                ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-400'
                : 'bg-blue-900/30 border-blue-700/40 text-blue-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${source === 'cache' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
              {source === 'cache' ? '⚡ Served from Redis Cache' : '🌐 Fetched from Jikan API'}
            </div>
          )}
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 pb-20">

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={40} className="text-purple-400 animate-spin" />
            <p className="text-gray-500 text-sm">Fetching this season's anime...</p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-2xl flex items-center gap-3 max-w-md text-center">
              <AlertCircle size={20} className="text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">
                {(error as any)?.response?.data?.message || 'Failed to load anime. Make sure your backend and Redis are running.'}
              </p>
            </div>
            <Link
              href="/"
              onClick={() => window.location.reload()}
              className="text-xs text-gray-500 hover:text-purple-400 underline underline-offset-4 transition-colors"
            >
              Try again
            </Link>
          </div>
        )}

        {/* Anime grid */}
        {!isLoading && !isError && animeList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {animeList.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
