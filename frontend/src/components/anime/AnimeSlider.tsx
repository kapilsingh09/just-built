"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
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
  data: Anime[];
  viewAllLink?: string;
  onAddToPlaylist?: (anime: Anime) => void;
}

export default function AnimeSlider({
  title,
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
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-primary"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>

        <div className="flex items-center gap-2">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll("left")}
            className={`w-9 h-9 rounded-xl border border-border flex items-center justify-center
                       transition-all duration-200 cursor-pointer
                       ${
                         canScrollLeft
                           ? "bg-white text-primary hover:bg-surface hover:border-secondary/40"
                           : "bg-surface text-border cursor-default"
                       }`}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`w-9 h-9 rounded-xl border border-border flex items-center justify-center
                       transition-all duration-200 cursor-pointer
                       ${
                         canScrollRight
                           ? "bg-white text-primary hover:bg-surface hover:border-secondary/40"
                           : "bg-surface text-border cursor-default"
                       }`}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* View All Link */}
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-accent
                         hover:text-accent-secondary transition-colors ml-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Scroll Container ─────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {data.map((anime, index) => (
          <motion.div
            key={anime.id}
            style={{ scrollSnapAlign: "start" }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <AnimeCard anime={anime} onAddToPlaylist={onAddToPlaylist} />
          </motion.div>
        ))}
      </div>
    </Container>
  );
}
