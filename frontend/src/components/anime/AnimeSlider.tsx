"use client";

import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Anime } from "@/types/anime";
import AnimeCard from "./AnimeCard";
import Container from "../shared/Container";

// ─── AnimeSlider ──────────────────────────────────────────────────────────────
// Horizontal scrollable slider with navigation arrows and touch support.
// ──────────────────────────────────────────────────────────────────────────────

interface AnimeSliderProps {
  title: string;
  subtitle?: string;   // backend route name, e.g. "GET /api/anime/popular"
  data: Anime[];
  viewAllLink?: string;
  onAddToPlaylist?: (anime: Anime) => void;
}

export default function AnimeSlider({
  title,
  subtitle,
  data,
  viewAllLink,
  onAddToPlaylist,
}: AnimeSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 280;
    const scrollAmount = cardWidth * 2;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    // Re-check after scroll animation
    setTimeout(checkScroll, 400);
  };

  if (data.length === 0) return null;

  return (
    <Container>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>

          {/* Route label */}
          {subtitle && (
            <p className="text-[11px] font-mono text-gray-400/60 mt-1 tracking-wide">
              {subtitle}
            </p>
          )}
        </div>

        {/* Length of card list and View All Link */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] font-semibold text-gray-400/50 uppercase tracking-wider">
            {data.length} {data.length === 1 ? "Title" : "Titles"}
          </span>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="flex items-center gap-1 text-sm font-medium text-accent
                         hover:text-accent-secondary transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Scroll Container with Floating Navigation ─────────────────────── */}
      <div className="relative group/slider">
        {/* Left Floating Button */}
        <button
          onClick={() => scroll("left")}
          className={`absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-20 group/left-btn
                     w-12 h-12 rounded-full bg-white/90 backdrop-blur-md
                     border border-border text-primary shadow-[0_8px_24px_rgba(0,0,0,0.08)]
                     flex items-center justify-center transition-all duration-300 cursor-pointer
                     hover:bg-white dark:hover:bg-zinc-900 hover:border-accent hover:text-accent 
                     hover:shadow-[0_8px_24px_rgba(245,158,11,0.2)] active:scale-90
                     ${canScrollLeft
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-90 pointer-events-none"
            }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 transition-transform duration-250 group-hover/left-btn:-translate-x-0.5" />
        </button>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4 px-1"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {data.map((anime) => (
            <div
              key={anime.id}
              style={{ scrollSnapAlign: "start" }}
            >
              <AnimeCard anime={anime} onAddToPlaylist={onAddToPlaylist} />
            </div>
          ))}
        </div>

        {/* Right Floating Button */}
        <button
          onClick={() => scroll("right")}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 group/right-btn
                     w-12 h-12 rounded-full bg-white/10 backdrop-blur-md
                     border border-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)]
                     flex items-center justify-center transition-all duration-300 cursor-pointer
                     hover:bg-white/20 hover:border-accent hover:text-accent 
                     hover:shadow-[0_8px_24px_rgba(245,158,11,0.2)] active:scale-90
                     ${canScrollRight
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-90 pointer-events-none"
            }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 transition-transform duration-250 group-hover/right-btn:translate-x-0.5" />
        </button>
      </div>
    </Container>
  );
}
