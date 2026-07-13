"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";
import { useJikanAnimeByGenre } from "@/hooks/useGenre";
import type { AnimeFilters } from "@/hooks/useGenre";
import FilterBar from "@/components/anime/FilterBar";
import AnimeGrid from "@/components/anime/AnimeGrid";
import type { Anime } from "@/types/anime";
import PlaylistModal from "@/components/playlist/PlaylistModal";

// ─── GenrePageContent ─────────────────────────────────────────────────────────
// The actual genre page body. Wrapped in Suspense in page.tsx because
// useSearchParams requires it in Next.js 13+.
// ──────────────────────────────────────────────────────────────────────────────

// Genre → accent color map for the hero header
const GENRE_ACCENT_COLORS: Record<string, string> = {
  Action:          "#ef4444",
  Adventure:       "#f97316",
  Comedy:          "#eab308",
  Drama:           "#8b5cf6",
  Fantasy:         "#06b6d4",
  Horror:          "#6b7280",
  Mystery:         "#3b82f6",
  Romance:         "#ec4899",
  "Sci-Fi":        "#14b8a6",
  "Slice of Life": "#f472b6",
  Sports:          "#22c55e",
  Supernatural:    "#a855f7",
  Thriller:        "#64748b",
  Mecha:           "#0ea5e9",
  Music:           "#f59e0b",
  Psychological:   "#7c3aed",
  Historical:      "#92400e",
  Military:        "#4b5563",
  Demons:          "#dc2626",
};

export default function GenrePageContent() {
  const params       = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const genreId      = params.id;
  const genreName    = searchParams.get("name") ?? "Genre";
  const accentColor  = GENRE_ACCENT_COLORS[genreName] ?? "#F47521";

  // ── Filters + pagination ───────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AnimeFilters>({
    sort:   "score",
    status: "",
    type:   "",
  });

  const handleFilterChange = (next: AnimeFilters) => {
    setFilters(next);
    setPage(1); // reset to page 1 on filter change
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, pagination, isLoading } = useJikanAnimeByGenre(genreId, page, filters);

  // ── Playlist modal ─────────────────────────────────────────────────────────
  const [playlistAnime, setPlaylistAnime] = useState<Anime | null>(null);
  const [playlistOpen,  setPlaylistOpen]  = useState(false);
  const handleAddToPlaylist = (anime: Anime) => {
    setPlaylistAnime(anime);
    setPlaylistOpen(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          position:     "relative",
          overflow:     "hidden",
          padding:      "4rem 0 3rem",
          background:   `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 50%, transparent 100%)`,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Decorative radial glow */}
        <div
          style={{
            position:      "absolute",
            top:           "-6rem",
            right:         "-6rem",
            width:         "24rem",
            height:        "24rem",
            borderRadius:  "50%",
            background:    `radial-gradient(circle, ${accentColor}20, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div className="container-main" style={{ position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "0.375rem",
              fontSize:     "0.8125rem",
              color:        "var(--secondary)",
              marginBottom: "1.5rem",
            }}
          >
            <Link
              href="/"
              style={{ color: "var(--secondary)", textDecoration: "none" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--secondary)")}
            >
              Home
            </Link>
            <span>/</span>
            <span>Genre</span>
            <span>/</span>
            <span style={{ color: accentColor, fontWeight: 600 }}>{genreName}</span>
          </nav>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            {/* Icon block */}
            <div
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                width:          "3.5rem",
                height:         "3.5rem",
                borderRadius:   "var(--radius-lg)",
                background:     `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
                border:         `1px solid ${accentColor}40`,
                flexShrink:     0,
              }}
            >
              <Layers style={{ width: "1.5rem", height: "1.5rem", color: accentColor }} />
            </div>

            <div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize:   "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color:      "var(--primary)",
                  margin:     0,
                  lineHeight: 1.15,
                }}
              >
                {genreName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize:  "0.9375rem",
                  color:     "var(--secondary)",
                  marginTop: "0.25rem",
                  margin:    0,
                }}
              >
                {pagination.total > 0
                  ? `${pagination.total.toLocaleString()} anime in this genre`
                  : "Explore anime in this genre"}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="container-main" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>

        {/* Filter bar */}
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          totalCount={pagination.total}
        />

        {/* Anime grid — animated key changes on filter/page updates */}
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
              onAddToPlaylist={handleAddToPlaylist}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Pagination controls ──────────────────────────────────────── */}
        {!isLoading && (pagination.hasNextPage || page > 1) && (
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            "0.75rem",
              marginTop:      "3rem",
              flexWrap:       "wrap",
            }}
          >
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        "0.375rem",
                padding:    "0.6rem 1.25rem",
                borderRadius: "var(--radius-full)",
                background: "var(--surface)",
                border:     "1px solid var(--border)",
                color:      page <= 1 ? "var(--secondary)" : "var(--primary)",
                fontSize:   "0.875rem",
                fontWeight: 600,
                cursor:     page <= 1 ? "not-allowed" : "pointer",
                opacity:    page <= 1 ? 0.4 : 1,
                transition: "all var(--transition-fast)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
              Prev
            </button>

            {/* Page indicator */}
            <div
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        "0.375rem",
                padding:    "0.6rem 1.25rem",
                borderRadius: "var(--radius-full)",
                background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
                border:     `1px solid ${accentColor}40`,
                fontSize:   "0.875rem",
                fontWeight: 700,
                color:      "var(--primary)",
              }}
            >
              Page{" "}
              <span style={{ color: accentColor }}>{page}</span>
              {pagination.lastPage > 1 && (
                <span style={{ color: "var(--secondary)", fontWeight: 400 }}>
                  {" "}/ {pagination.lastPage}
                </span>
              )}
            </div>

            {/* Next */}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              aria-label="Next page"
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        "0.375rem",
                padding:    "0.6rem 1.25rem",
                borderRadius: "var(--radius-full)",
                background: !pagination.hasNextPage
                  ? "var(--surface)"
                  : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                border:     `1px solid ${!pagination.hasNextPage ? "var(--border)" : accentColor}`,
                color:      !pagination.hasNextPage ? "var(--secondary)" : "#fff",
                fontSize:   "0.875rem",
                fontWeight: 600,
                cursor:     !pagination.hasNextPage ? "not-allowed" : "pointer",
                opacity:    !pagination.hasNextPage ? 0.4 : 1,
                transition: "all var(--transition-fast)",
                fontFamily: "var(--font-sans)",
                boxShadow:  !pagination.hasNextPage ? "none" : `0 4px 16px ${accentColor}30`,
              }}
            >
              Next
              <ChevronRight style={{ width: "1rem", height: "1rem" }} />
            </button>
          </div>
        )}
      </div>

      {/* Playlist modal */}
      <PlaylistModal
        isOpen={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        anime={playlistAnime}
      />
    </div>
  );
}
