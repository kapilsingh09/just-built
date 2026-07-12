"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Star, Tv, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { Anime } from "@/types/anime";
import AnimeBadge from "../anime/AnimeBadge";
import Button from "../buttons/Button";

// ─── HeroSlider ───────────────────────────────────────────────────────────────
// 90vh cinematic carousel with auto-advance, gradient overlays, and full info.
// ──────────────────────────────────────────────────────────────────────────────

interface HeroSliderProps {
  anime: Anime[];
  onAddToPlaylist?: (anime: Anime) => void;
}

export default function HeroSlider({ anime, onAddToPlaylist }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const slideCount = anime.length;

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slideCount);
    setIsExpanded(false);
  }, [slideCount]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
    setIsExpanded(false);
  }, [slideCount]);

  // Auto-advance every 6s
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (slideCount === 0) return null;

  const currentAnime = anime[current];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-30%" : "30%",
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden bg-black">
      {/* ── Background Image Slides ──────────────────────────────────────── */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Banner Image */}
          {(currentAnime.bannerImage || currentAnime.image) && (
            <>
              {/* Blurred background fill — makes portrait posters look full-screen */}
              <Image
                src={(currentAnime.bannerImage || currentAnime.image) as string}
                alt=""
                fill
                priority
                quality={60}
                sizes="100vw"
                className="object-cover object-center scale-110 blur-xl opacity-60"
                aria-hidden
              />
              {/* Sharp main image on top */}
              <Image
                src={(currentAnime.bannerImage || currentAnime.image) as string}
                alt={currentAnime.title || "Anime"}
                fill
                priority
                quality={100}
                sizes="100vw"
                className="object-cover object-center"
              />
            </>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 gradient-overlay" />
          <div className="absolute inset-0 gradient-overlay-left" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex items-end">
        <div className="container-main pb-20 md:pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, filter: "blur(12px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(12px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-2xl relative"
            >
              {/* Soft blur blob behind text for readability without a visible box */}
              <div className="absolute -inset-8 md:-inset-12 bg-black/40 blur-[40px] rounded-full pointer-events-none" />

              <div className="relative z-10">

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {currentAnime.type && (
                    <span className="badge-base bg-[#F47521] text-white text-xs font-semibold">
                      {currentAnime.type}
                    </span>
                  )}
                  {currentAnime.score && (
                    <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                      <Star className="w-3 h-3 text-accent" fill="currentColor" />
                      {currentAnime.score.toFixed(1)}
                    </span>
                  )}
                  {currentAnime.year && (
                    <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                      <Calendar className="w-3 h-3" />
                      {currentAnime.year}
                    </span>
                  )}
                  {currentAnime.episodes && (
                    <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                      <Tv className="w-3 h-3" />
                      {currentAnime.episodes} Episodes
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                  {currentAnime.title}
                </h1>

                {/* Description */}
                {currentAnime.synopsis && (
                  <div className="mb-5 max-w-xl">
                    <div
                      className={`text-white/80 text-sm sm:text-base leading-relaxed pr-1 transition-all duration-300 ${isExpanded
                          ? "max-h-40 overflow-y-auto"
                          : "line-clamp-3"
                        }`}
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255,255,255,0.2) transparent",
                      }}
                    >
                      {currentAnime.synopsis}
                    </div>
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-2 text-sm font-semibold text-[#F47521] hover:text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? "See Less" : "See More"}
                    </button>
                  </div>
                )}

                {/* Genres */}
                {currentAnime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {currentAnime.genres.slice(0, 4).map((g) => (
                      <span
                        key={g}
                        className="badge-base bg-white/10 backdrop-blur-sm text-white/90 border border-white/15 text-xs"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA Buttons */}
              </div>
            </motion.div>
          </AnimatePresence>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<Play className="w-5 h-5 " fill="currentColor" />}
                  >
                    Watch Now
                  </Button>
                  <Button
                    size="lg"
                    className="!bg-white/15 !border-white/25 !text-white hover:!bg-white/25 backdrop-blur-sm"
                    onClick={() => onAddToPlaylist?.(currentAnime)}
                  >
                    Add To List
                  </Button>
                </div>
        </div>
      </div>

      {/* ── Navigation Arrows — bottom-right, hidden on mobile ──────────── */}
      <div className=" absolute flex flex-col bottom-20 right-8 z-20 items-center gap-3">
        <button
          onClick={prev}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     flex items-center justify-center text-white shadow-lg
                     hover:bg-white/25 hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     flex items-center justify-center text-white shadow-lg
                     hover:bg-white/25 hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* ── Dots ─────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {anime.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === current
              ? "w-8 border-3 bg-white "
              : "w-3 bg-white/40 hover:bg-white/60"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Progress Bar ─────────────────────────────────────────────────── */}
      {/* <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
        <motion.div
          key={current}
          className="h-full bg-accent"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
        />
      </div> */}
    </section>
  );
}
