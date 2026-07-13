"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { Anime, AnimeApiResponse } from "@/types/anime";

// ─────────────────────────────────────────────────────────────────────────────
// Genre types
// ─────────────────────────────────────────────────────────────────────────────
export interface Genre {
  id:    number;
  name:  string;
  count: number;
}

export interface GenreApiResponse {
  success: boolean;
  source:  "cache" | "api";
  data:    Genre[];
}

export interface GenreAnimeApiResponse extends AnimeApiResponse {
  pagination: {
    hasNextPage: boolean;
    currentPage: number;
    lastPage:    number;
    total:       number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useJikanGenres
//
// Fetches the full list of anime genres from Jikan.
// Route: GET /api/jikan/genres
// Cache: 24h on server, 1h on client (rarely changes)
// ─────────────────────────────────────────────────────────────────────────────
export function useJikanGenres() {
  const { data, isLoading, isError, error } = useQuery<GenreApiResponse>({
    queryKey: ["jikan", "genres"],
    queryFn: async () => {
      const res = await axiosInstance.get<GenreApiResponse>("/jikan/genres");
      return res.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    genres:    data?.data ?? [] as Genre[],
    source:    data?.source ?? null,
    isLoading,
    isError,
    error,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useJikanAnimeByGenre
//
// Fetches anime filtered by genre ID with optional filter params.
// Route: GET /api/jikan/genre/:genreId?page=1&sort=score&status=&type=
//
// Params:
//   genreId — Jikan genre ID (number)
//   page    — page number (default: 1)
//   sort    — "score" | "popularity" | "latest" | "title"
//   status  — "airing" | "complete" | "upcoming" | "" (all)
//   type    — "tv" | "movie" | "ova" | "special" | "" (all)
// ─────────────────────────────────────────────────────────────────────────────
export interface AnimeFilters {
  sort:   string;
  status: string;
  type:   string;
}

export function useJikanAnimeByGenre(
  genreId: number | string | null,
  page: number = 1,
  filters: AnimeFilters = { sort: "score", status: "", type: "" },
) {
  const { data, isLoading, isError, error } = useQuery<GenreAnimeApiResponse>({
    queryKey: ["jikan", "genre", genreId, page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page:   String(page),
        sort:   filters.sort,
        status: filters.status,
        type:   filters.type,
      });
      const res = await axiosInstance.get<GenreAnimeApiResponse>(
        `/jikan/genre/${genreId}?${params.toString()}`,
      );
      return res.data;
    },
    enabled: !!genreId,
    staleTime: 1000 * 60 * 5, // 5 min — filters change frequently
  });

  return {
    data:       data?.data       ?? [] as Anime[],
    pagination: data?.pagination ?? { hasNextPage: false, currentPage: 1, lastPage: 1, total: 0 },
    source:     data?.source     ?? null,
    isLoading,
    isError,
    error,
  };
}
