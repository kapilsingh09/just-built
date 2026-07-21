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
      <div className="flex items-center justify-between mb-3">
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
        <button
          onClick={() => scroll("left")}
          className={`absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 group/left-btn
                     w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     flex items-center justify-center text-white shadow-lg
                     hover:bg-white/25 transition-all duration-300 cursor-pointer active:scale-95
                     ${canScrollLeft
              ? "opacity-100 hover:scale-105 pointer-events-auto"
              : "opacity-0 scale-90 pointer-events-none"
            }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 transition-transform duration-250 group-hover/left-btn:-translate-x-0.5" />
        </button>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto hide-scrollbar scroll-smooth py-6 px-2 -my-6"
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

        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-20 group/right-btn
                     w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     flex items-center justify-center text-white shadow-lg
                     hover:bg-white/25 transition-all duration-300 cursor-pointer active:scale-95
                     ${canScrollRight
              ? "opacity-100 hover:scale-105 pointer-events-auto"
              : "opacity-0 scale-90 pointer-events-none"
            }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 transition-transform duration-250 group-hover/right-btn:translate-x-0.5" />
        </button>
      </div>
    </Container>
  );
}
