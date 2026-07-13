"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useJikanGenres } from "@/hooks/useGenre";
import type { Genre } from "@/hooks/useGenre";

// ─── GenreStrip ───────────────────────────────────────────────────────────────
// Horizontal scrollable strip of genre pill cards.
// Clicking a genre navigates to /genre/[id]?name=[name].
// ──────────────────────────────────────────────────────────────────────────────

// Genre → icon + gradient color mapping for visual appeal
const GENRE_STYLES: Record<string, { emoji: string; from: string; to: string }> = {
  Action:        { emoji: "⚔️",  from: "#ef4444", to: "#b91c1c" },
  Adventure:     { emoji: "🗺️",  from: "#f97316", to: "#c2410c" },
  Comedy:        { emoji: "😂",  from: "#eab308", to: "#a16207" },
  Drama:         { emoji: "🎭",  from: "#8b5cf6", to: "#6d28d9" },
  Fantasy:       { emoji: "🧙",  from: "#06b6d4", to: "#0e7490" },
  Horror:        { emoji: "👻",  from: "#6b7280", to: "#374151" },
  Mystery:       { emoji: "🔍",  from: "#3b82f6", to: "#1d4ed8" },
  Romance:       { emoji: "💕",  from: "#ec4899", to: "#be185d" },
  "Sci-Fi":      { emoji: "🚀",  from: "#14b8a6", to: "#0f766e" },
  "Slice of Life": { emoji: "🌸", from: "#f472b6", to: "#db2777" },
  Sports:        { emoji: "⚽",  from: "#22c55e", to: "#15803d" },
  Supernatural:  { emoji: "✨",  from: "#a855f7", to: "#7e22ce" },
  Thriller:      { emoji: "😱",  from: "#64748b", to: "#334155" },
  Mecha:         { emoji: "🤖",  from: "#0ea5e9", to: "#0369a1" },
  Music:         { emoji: "🎵",  from: "#f59e0b", to: "#b45309" },
  Psychological: { emoji: "🧠",  from: "#7c3aed", to: "#4c1d95" },
  Historical:    { emoji: "📜",  from: "#92400e", to: "#78350f" },
  Military:      { emoji: "🎖️",  from: "#4b5563", to: "#1f2937" },
  Isekai:        { emoji: "🌀",  from: "#10b981", to: "#065f46" },
  Demons:        { emoji: "😈",  from: "#dc2626", to: "#7f1d1d" },
};

const DEFAULT_STYLE = { emoji: "🎌", from: "#F47521", to: "#e57429" };

// Show only the most popular genres in the strip (top 20 by count)
const STRIP_LIMIT = 20;

interface GenrePillProps {
  genre: Genre;
  index: number;
}

function GenrePill({ genre, index }: GenrePillProps) {
  const router  = useRouter();
  const style   = GENRE_STYLES[genre.name] ?? DEFAULT_STYLE;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y:  0 }}
      transition={{ duration: 0.35, delay: index * 0.035, ease: "easeOut" }}
      onClick={() =>
        router.push(`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`)
      }
      aria-label={`Browse ${genre.name} anime`}
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "0.5rem",
        flexShrink:     0,
        width:          "7.5rem",
        height:         "5rem",
        borderRadius:   "var(--radius-xl)",
        background:     `linear-gradient(135deg, ${style.from}18, ${style.to}10)`,
        border:         `1px solid ${style.from}30`,
        cursor:         "pointer",
        transition:     "all var(--transition-fast)",
        position:       "relative",
        overflow:       "hidden",
      }}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background      = `linear-gradient(135deg, ${style.from}35, ${style.to}25)`;
        el.style.borderColor     = `${style.from}70`;
        el.style.boxShadow       = `0 8px 24px ${style.from}25`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background      = `linear-gradient(135deg, ${style.from}18, ${style.to}10)`;
        el.style.borderColor     = `${style.from}30`;
        el.style.boxShadow       = "none";
      }}
    >
      {/* Glow dot */}
      <div
        style={{
          position:     "absolute",
          top:          "-1rem",
          right:        "-1rem",
          width:        "3rem",
          height:       "3rem",
          borderRadius: "50%",
          background:   `radial-gradient(circle, ${style.from}30, transparent)`,
          pointerEvents: "none",
        }}
      />
      <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{style.emoji}</span>
      <span
        style={{
          fontSize:   "0.75rem",
          fontWeight: 600,
          color:      "var(--primary)",
          textAlign:  "center",
          lineHeight: 1.2,
          paddingInline: "0.25rem",
        }}
      >
        {genre.name}
      </span>
    </motion.button>
  );
}

// ─── GenreStrip ───────────────────────────────────────────────────────────────
export default function GenreStrip() {
  const { genres, isLoading } = useJikanGenres();

  const topGenres = genres.slice(0, STRIP_LIMIT);

  return (
    <section aria-label="Browse by genre">
      {/* Section header */}
      <div
        style={{
          display:        "flex",
          alignItems:     "baseline",
          justifyContent: "space-between",
          marginBottom:   "1.25rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize:   "1.25rem",
              fontWeight: 700,
              color:      "var(--primary)",
              margin:     0,
            }}
          >
            🎌 Browse by Genre
          </h2>
          <p
            style={{
              fontSize:   "0.8125rem",
              color:      "var(--secondary)",
              marginTop:  "0.25rem",
              margin:     0,
            }}
          >
            Click a genre to explore anime
          </p>
        </div>
      </div>

      {/* Horizontal scrollable pill strip */}
      <div
        className="hide-scrollbar"
        style={{
          display:        "flex",
          gap:            "0.75rem",
          overflowX:      "auto",
          paddingBottom:  "0.5rem",
          scrollSnapType: "x mandatory",
        }}
      >
        {isLoading
          ? // Skeleton pills
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flexShrink:    0,
                  width:         "7.5rem",
                  height:        "5rem",
                  borderRadius:  "var(--radius-xl)",
                  background:    "var(--surface)",
                  border:        "1px solid var(--border)",
                  opacity:       0.6,
                  animation:     `pulse 1.6s ease-in-out ${i * 0.08}s infinite`,
                }}
              />
            ))
          : topGenres.map((genre, i) => (
              <GenrePill key={genre.id} genre={genre} index={i} />
            ))}
      </div>
    </section>
  );
}
