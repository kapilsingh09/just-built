"use client";

import { motion } from "framer-motion";
import { Star, Tv, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  // ── Detail page URL ─────────────────────────────────────────────────────────
  // Uses anime.source ("jikan" | "kitsu") set by the backend transform.
  // Route: /anime/jikan/:mal_id  or  /anime/kitsu/:kitsu_id
  const detailHref = `/anime/${anime.source}/${anime.id}`;

  return (
    <Link href={detailHref} className="block group relative flex-shrink-0 w-[var(--card-width)] h-[var(--card-height)] cursor-pointer">
      <div className="card-base overflow-hidden card-hover h-full w-full relative transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]">
        {/* ── Poster Background ───────────────────────────────────────────── */}
        {anime.image ? (
          <Image
            src={anime.image}
            alt={anime.title ?? "Anime"}
            fill
            sizes="(max-width: 640px) 240px, (max-width: 1024px) 260px, 270px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <Tv className="w-12 h-12 text-border" />
          </div>
        )}

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* ── Top section: Score and Type (Glass Effect) ─────────────────── */}
        {anime.score != null && (
          <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-sm rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1 z-10">
            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            {anime.score.toFixed(1)}
          </div>
        )}

        {anime.type && (
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-sm rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide z-10">
            {anime.type}
          </div>
        )}

        {/* ── Bottom Overlay: Title & Add Button ─────────────────────────── */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent h-30 backdrop-blur-md pb-3 px-3 flex items-end justify-between z-10 transform translate-y-0 transition-transform duration-300">
          <h3 className="font-semibold text-sm text-white line-clamp-2 pr-2">
            {anime.title ?? "Untitled"}
          </h3>

          {onAddToPlaylist && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToPlaylist(anime); }}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-black
                         flex items-center justify-center transition-transform hover:scale-110 shadow-md cursor-pointer"
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
      </div>
    </Link>
  );
}
