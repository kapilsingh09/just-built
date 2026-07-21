"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Layers } from "lucide-react";
import Link from "next/link";
import { useJikanAnimeByGenre } from "@/hooks/useGenre";
import type { AnimeFilters } from "@/hooks/useGenre";
import FilterBar from "@/components/anime/FilterBar";
import AnimeGrid from "@/components/anime/AnimeGrid";
import type { Anime } from "@/types/anime";
import PlaylistModal from "@/components/playlist/PlaylistModal";

// ─── ResultsContent ───────────────────────────────────────────────────────────
// Shared results page used by:
//   • Genre browsing  → /results?genre=<id>&name=<GenreName>
//   • Search (future) → /results?q=<query>
//
// The page auto-detects which mode it's in via URL params.
// ──────────────────────────────────────────────────────────────────────────────

const GENRE_COLORS: Record<string, string> = {
  Action: "#ef4444",
  Adventure: "#f97316",
  Comedy: "#eab308",
  Drama: "#8b5cf6",
  Fantasy: "#06b6d4",
  Horror: "#9ca3af",
  Mystery: "#3b82f6",
  Romance: "#ec4899",
  "Sci-Fi": "#14b8a6",
  "Slice of Life": "#f472b6",
  Sports: "#22c55e",
  Supernatural: "#a855f7",
  Thriller: "#64748b",
  Mecha: "#0ea5e9",
  Music: "#f59e0b",
  Psychological: "#7c3aed",
  Historical: "#b45309",
  Military: "#6b7280",
  Demons: "#dc2626",
  Isekai: "#10b981",
  "Martial Arts": "#f59e0b",
  Magic: "#c084fc",
  School: "#60a5fa",
  "Super Power": "#facc15",
  Vampire: "#be123c",
};

const GENRE_EMOJI: Record<string, string> = {
  Action: "⚔️", Adventure: "🗺️", Comedy: "😂", Drama: "🎭",
  Fantasy: "🧙", Horror: "👻", Mystery: "🔍", Romance: "💕",
  "Sci-Fi": "🚀", "Slice of Life": "🌸", Sports: "⚽",
  Supernatural: "✨", Thriller: "😱", Mecha: "🤖", Music: "🎵",
  Psychological: "🧠", Historical: "📜", Military: "🎖️",
  Demons: "😈", Isekai: "🌀", "Martial Arts": "🥋", Magic: "🪄",
  School: "🏫", "Super Power": "⚡", Vampire: "🧛",
};

export default function ResultsContent() {
  const searchParams = useSearchParams();

  // ── Detect mode ────────────────────────────────────────────────────────────
  const genreId = searchParams.get("genre");
  const genreName = searchParams.get("name") ?? "";
  const query = searchParams.get("q") ?? "";
  const isSearch = !!query && !genreId;
  const isGenre = !!genreId;

  const accentColor = GENRE_COLORS[genreName] ?? "#F47521";
  const emoji = GENRE_EMOJI[genreName] ?? (isSearch ? "🔍" : "🎌");
  const pageTitle = isSearch ? `"${query}"` : genreName || "Results";

  // ── Filters + pagination (genre mode only) ─────────────────────────────────
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AnimeFilters>({ sort: "score", status: "", type: "" });

  const handleFilterChange = (next: AnimeFilters) => {
    setFilters(next);
    setPage(1);
  };

  // Reset page when URL params change
  useEffect(() => { setPage(1); setFilters({ sort: "score", status: "", type: "" }); }, [genreId, query]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  // ── Data (genre mode) ──────────────────────────────────────────────────────
  const { data, pagination, isLoading } = useJikanAnimeByGenre(
    isGenre ? genreId : null,
    page,
    filters,
  );

  // ── Playlist modal ─────────────────────────────────────────────────────────
  const [playlistAnime, setPlaylistAnime] = useState<Anime | null>(null);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#111" }}>

      {/* ════════════════════════════════════════════════════════════════════
          HERO — Sleek and minimal gradient header
          ════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden" style={{ display: "flex", alignItems: "flex-end" }}>

        {/* Ambient gradient backdrop */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 60% 50% at 50% 0%, ${accentColor}20 0%, transparent 70%),
              linear-gradient(180deg, #0d0d0d 0%, #111 100%)
            `,
          }}
        />

        {/* Bottom fade */}
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #111 100%)" }} />

        {/* Content */}
        <div
          className="container-main"
          style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "2rem" }}
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}
          >
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)")}
            >Home</Link>
            <ChevronRight style={{ width: "0.8rem", height: "0.8rem" }} />
            {isSearch
              ? <span>Search</span>
              : <><Link href="/explore" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)")}
              >Explore</Link><ChevronRight style={{ width: "0.8rem", height: "0.8rem" }} /></>
            }
            <span style={{ color: accentColor, fontWeight: 600 }}>{pageTitle}</span>
          </nav>

          {/* Title block */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "1rem",
                background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
                border: `1px solid ${accentColor}40`,
                fontSize: "1.5rem",
                flexShrink: 0,
              }}
            >
              {isSearch ? <Search style={{ width: "1.5rem", height: "1.5rem", color: accentColor }} /> : emoji}
            </motion.div>

            <div>
              <motion.h1
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {isSearch ? (
                  <><span style={{ color: accentColor }}>&ldquo;</span>{query}<span style={{ color: accentColor }}>&rdquo;</span></>
                ) : (
                  <><span style={{ color: accentColor }}>{genreName}</span> <span style={{ color: "rgba(255,255,255,0.9)" }}>Anime</span></>
                )}
              </motion.h1>

              {pagination.total > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}
                >
                  {pagination.total.toLocaleString()} titles found
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CONTENT
          ════════════════════════════════════════════════════════════════════ */}
      <div className="container-main" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>

        {/* Filter bar — only shown in genre mode */}
        {isGenre && (
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            totalCount={pagination.total}
          />
        )}

        {/* Search placeholder removed to reduce clutter. Future search results will render below. */}

        {/* Genre anime grid */}
        {isGenre && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${genreId}-${page}-${filters.sort}-${filters.status}-${filters.type}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AnimeGrid
                data={data}
                isLoading={isLoading}
                totalCount={pagination.total}
                onAddToPlaylist={(anime) => { setPlaylistAnime(anime); setPlaylistOpen(true); }}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {isGenre && !isLoading && (pagination.hasNextPage || page > 1) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "4rem", flexWrap: "wrap" }}>
            {/* Prev */}
            <motion.button
              whileHover={{ scale: page <= 1 ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: page <= 1 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: page <= 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              <ChevronLeft style={{ width: "1.2rem", height: "1.2rem" }} />
              Prev
            </motion.button>

            {/* Page indicator */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.1)",
              border: `1px solid ${accentColor}50`,
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#fff",
            }}>
              Page <span style={{ color: accentColor }}>{page}</span>
              {pagination.lastPage > 1 && (
                <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>of {pagination.lastPage}</span>
              )}
            </div>

            {/* Next */}
            <motion.button
              whileHover={{ scale: !pagination.hasNextPage ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              aria-label="Next page"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "9999px",
                background: !pagination.hasNextPage ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`,
                border: `1px solid ${!pagination.hasNextPage ? "rgba(255,255,255,0.1)" : accentColor}`,
                color: !pagination.hasNextPage ? "rgba(255,255,255,0.3)" : "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: !pagination.hasNextPage ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              Next
              <ChevronRight style={{ width: "1.2rem", height: "1.2rem" }} />
            </motion.button>
          </div>
        )}
      </div>

      <PlaylistModal
        isOpen={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        anime={playlistAnime}
      />
    </div>
  );
}
