"use client";

import { motion } from "framer-motion";
import { Star, Tv, Calendar } from "lucide-react";
import Image from "next/image";
import type { Anime } from "@/types/anime";
import AnimeBadge from "./AnimeBadge";

// ─── AnimeCard ────────────────────────────────────────────────────────────────
// Reusable poster card. Works with any Anime — Jikan or Kitsu — since the
// backend normalises both into the same shape before sending.
// ──────────────────────────────────────────────────────────────────────────────

interface AnimeCardProps {
  anime: Anime;
  onAddToPlaylist?: (anime: Anime) => void;
}

export default function AnimeCard({ anime, onAddToPlaylist }: AnimeCardProps) {
  return (
    <motion.div
      className="group relative flex-shrink-0 w-[240px] sm:w-[260px] lg:w-[270px] cursor-pointer"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="card-base overflow-hidden hover-glow">

        {/* ── Poster ──────────────────────────────────────────────────────── */}
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          {anime.image ? (
            <Image
              src={anime.image}
              alt={anime.title ?? "Anime"}
              fill
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 260px, 270px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface">
              <Tv className="w-12 h-12 text-border" />
            </div>
          )}

          {/* Gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Score — top left */}
          {anime.score != null && (
            <div className="absolute top-3 left-3 badge-base badge-rating">
              <Star className="w-3 h-3" fill="currentColor" />
              {anime.score.toFixed(1)}
            </div>
          )}

          {/* Type — top right */}
          {anime.type && (
            <div className="absolute top-3 right-3 badge-base badge-type text-[10px]">
              {anime.type}
            </div>
          )}

          {/* Add to playlist — bottom right on hover */}
          {onAddToPlaylist && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToPlaylist(anime); }}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm
                         flex items-center justify-center text-primary
                         opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                         transition-all duration-300 hover:bg-accent hover:text-white
                         shadow-md cursor-pointer"
              aria-label="Add to playlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Info ─────────────────────────────────────────────────────────── */}
        <div className="p-3.5">
          <h3 className="font-semibold text-sm text-primary line-clamp-1 mb-1.5">
            {anime.title ?? "Untitled"}
          </h3>

          <div className="flex items-center gap-3 text-secondary text-xs">
            {anime.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {anime.year}
              </span>
            )}
            {anime.episodes && (
              <span className="flex items-center gap-1">
                <Tv className="w-3 h-3" /> {anime.episodes} eps
              </span>
            )}
          </div>

          {/* Genres (Jikan) */}
          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {anime.genres.slice(0, 2).map((g) => (
                <AnimeBadge key={g} label={g} variant="genre" />
              ))}
            </div>
          )}

          {/* Rating badge fallback (Kitsu — no genres) */}
          {anime.genres.length === 0 && anime.rating && (
            <div className="mt-2">
              <AnimeBadge label={anime.rating} variant="rating" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
