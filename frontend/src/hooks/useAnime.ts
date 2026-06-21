"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { Anime, AnimeApiResponse } from "@/types/anime";

// ─── usePopularAnime ──────────────────────────────────────────────────────────
// Fetches the popular anime list and derives slices for each homepage section.
// All sections draw from the single /api/anime/popular endpoint.
// ──────────────────────────────────────────────────────────────────────────────

export function usePopularAnime() {
  const { data, isLoading, isError, error } = useQuery<AnimeApiResponse>({
    queryKey: ["anime", "popular"],
    queryFn: async () => {
      const res = await axiosInstance.get<AnimeApiResponse>("/anime/popular");
      return res.data;
    },
  });

  const allAnime = data?.data ?? [];
  const meta = data?.meta ?? null;
  const source = data?.source ?? null;

  // ── Derive sections from the single pool ──────────────────────────────────
  // Hero: top 5 by score (best visual impact)
  const heroAnime: Anime[] = [...allAnime]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5);

  // Trending: next 10 after hero
  const trendingAnime: Anime[] = allAnime.slice(0, 10);

  // Popular: shuffled subset for variety
  const popularAnime: Anime[] = [...allAnime]
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  // Top Rated: sorted by score descending
  const topRatedAnime: Anime[] = [...allAnime]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 10);

  // Latest: those with "Currently Airing" or latest year
  const latestEpisodes: Anime[] = [...allAnime]
    .filter((a) => a.status === "Currently Airing")
    .slice(0, 10);

  return {
    allAnime,
    heroAnime,
    trendingAnime,
    popularAnime,
    topRatedAnime,
    latestEpisodes,
    meta,
    source,
    isLoading,
    isError,
    error,
  };
}
