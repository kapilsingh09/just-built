"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { Anime, AnimeApiResponse } from "@/types/anime";

// ─────────────────────────────────────────────────────────────────────────────
// All hooks return the exact same shape — Anime[] — because the backend
// normalises both Jikan and Kitsu into the shared Anime type.
// No frontend transformation is needed.
// ─────────────────────────────────────────────────────────────────────────────

// ── useJikanPopular ───────────────────────────────────────────────────────────
// Route:  GET /api/jikan/popular
// Source: Jikan API (MyAnimeList) — currently airing, ranked by score
// ─────────────────────────────────────────────────────────────────────────────
export function useJikanPopular() {
  const { data, isLoading, isError, error } = useQuery<AnimeApiResponse>({
    queryKey: ["jikan", "popular"],
    queryFn: async () => {
      const res = await axiosInstance.get<AnimeApiResponse>("/jikan/popular");
      return res.data;
    },
  });

  return {
    data:      data?.data ?? [] as Anime[],
    source:    data?.source ?? null,
    route:     "GET /api/jikan/popular",
    isLoading,
    isError,
    error,
  };
}

// ── useKitsuPopular ───────────────────────────────────────────────────────────
// Route:  GET /api/anime/popular
// Source: Kitsu API — sorted by -userCount (most followed)
// ─────────────────────────────────────────────────────────────────────────────
export function useKitsuPopular() {
  const { data, isLoading, isError, error } = useQuery<AnimeApiResponse>({
    queryKey: ["kitsu", "popular"],
    queryFn: async () => {
      const res = await axiosInstance.get<AnimeApiResponse>("/anime/popular");
      return res.data;
    },
  });

  return {
    data:      data?.data ?? [] as Anime[],
    source:    data?.source ?? null,
    route:     "GET /api/anime/popular",
    isLoading,
    isError,
    error,
  };
}

// ── useKitsuTopRated ──────────────────────────────────────────────────────────
// Route:  GET /api/anime/top-rated
// Source: Kitsu API — sorted by -averageRating (highest community score)
// ─────────────────────────────────────────────────────────────────────────────
export function useKitsuTopRated() {
  const { data, isLoading, isError, error } = useQuery<AnimeApiResponse>({
    queryKey: ["kitsu", "top-rated"],
    queryFn: async () => {
      const res = await axiosInstance.get<AnimeApiResponse>("/anime/top-rated");
      return res.data;
    },
  });

  return {
    data:      data?.data ?? [] as Anime[],
    source:    data?.source ?? null,
    route:     "GET /api/anime/top-rated",
    isLoading,
    isError,
    error,
  };
}

// ── useKitsuLatest ────────────────────────────────────────────────────────────
// Route:  GET /api/anime/latest
// Source: Kitsu API — sorted by -startDate (newest by air date)
// ─────────────────────────────────────────────────────────────────────────────
export function useKitsuLatest() {
  const { data, isLoading, isError, error } = useQuery<AnimeApiResponse>({
    queryKey: ["kitsu", "latest"],
    queryFn: async () => {
      const res = await axiosInstance.get<AnimeApiResponse>("/anime/latest");
      return res.data;
    },
  });

  return {
    data:      data?.data ?? [] as Anime[],
    source:    data?.source ?? null,
    route:     "GET /api/anime/latest",
    isLoading,
    isError,
    error,
  };
}
