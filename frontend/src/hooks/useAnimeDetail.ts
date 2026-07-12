"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type {
  AnimeDetailApiResponse,
  EpisodeApiResponse,
} from "@/types/anime";

// ─────────────────────────────────────────────────────────────────────────────
// useAnimeDetail
//
// Fetches full detail for a single anime.
//
// source  = "jikan" → calls GET /api/jikan/:id
// source  = "kitsu" → calls GET /api/anime/:id
//
// The hook automatically picks the correct backend route so the calling
// component never needs to branch on source.
// ─────────────────────────────────────────────────────────────────────────────
export function useAnimeDetail(source: "jikan" | "kitsu", id: string | number) {
  const { data, isLoading, isError, error } = useQuery<AnimeDetailApiResponse>({
    queryKey: ["anime", "detail", source, id],
    queryFn: async () => {
      // ── ROUTE SWITCH — add a new source here if you add more APIs ──────────
      const endpoint =
        source === "jikan"
          ? `/jikan/${id}`      // GET /api/jikan/:id
          : `/anime/${id}`;     // GET /api/anime/:id

      const res = await axiosInstance.get<AnimeDetailApiResponse>(endpoint);
      return res.data;
    },
    enabled: !!id,   // don't fetch if id is missing
    staleTime: 1000 * 60 * 30, // 30 min client-side cache (Redis handles server-side)
  });

  return {
    data:      data?.data    ?? null,
    source:    data?.source  ?? null,
    isLoading,
    isError,
    error,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useAnimeEpisodes
//
// Fetches episode list (page 1) for a single anime.
//
// source  = "jikan" → calls GET /api/jikan/:id/episodes
// source  = "kitsu" → calls GET /api/anime/:id/episodes
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  TODO: ADD PAGINATION                                                   ║
// ║  1. Add a `page` param to this hook.                                    ║
// ║  2. Add ?page=N to the endpoint URL.                                    ║
// ║  3. Use useInfiniteQuery instead of useQuery for infinite scroll.       ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// ─────────────────────────────────────────────────────────────────────────────
export function useAnimeEpisodes(source: "jikan" | "kitsu", id: string | number) {
  const { data, isLoading, isError, error } = useQuery<EpisodeApiResponse>({
    queryKey: ["anime", "episodes", source, id],
    queryFn: async () => {
      // ── ROUTE SWITCH — add a new source here if you add more APIs ──────────
      const endpoint =
        source === "jikan"
          ? `/jikan/${id}/episodes`   // GET /api/jikan/:id/episodes
          : `/anime/${id}/episodes`;  // GET /api/anime/:id/episodes

      const res = await axiosInstance.get<EpisodeApiResponse>(endpoint);
      return res.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour — episodes change rarely
  });

  return {
    episodes:   data?.data        ?? [],
    pagination: data?.pagination  ?? { hasNextPage: false, currentPage: 1 },
    isLoading,
    isError,
    error,
  };
}
