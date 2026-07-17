"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useJikanGenres } from "@/hooks/useGenre";
import type { Genre } from "@/hooks/useGenre";

// ─── GenreStrip ───────────────────────────────────────────────────────────────
// Horizontal scrollable strip of glassmorphism genre cards.
// Clicking a genre navigates to /results?genre=<id>&name=<name>
// ──────────────────────────────────────────────────────────────────────────────

const GENRE_META: Record<string, { emoji: string }> = {
  Action: { emoji: "⚔️" },
  Adventure: { emoji: "🗺️" },
  Comedy: { emoji: "😂" },
  Drama: { emoji: "🎭" },
  Fantasy: { emoji: "🧙" },
  Horror: { emoji: "👻" },
  Mystery: { emoji: "🔍" },
  Romance: { emoji: "💕" },
  "Sci-Fi": { emoji: "🚀" },
  "Slice of Life": { emoji: "🌸" },
  Sports: { emoji: "⚽" },
  Supernatural: { emoji: "✨" },
  Thriller: { emoji: "😱" },
  Mecha: { emoji: "🤖" },
  Music: { emoji: "🎵" },
  Psychological: { emoji: "🧠" },
  Historical: { emoji: "📜" },
  Military: { emoji: "🎖️" },
  Demons: { emoji: "😈" },
  Isekai: { emoji: "🌀" },
  "Martial Arts": { emoji: "🥋" },
  Magic: { emoji: "🪄" },
  School: { emoji: "🏫" },
  "Super Power": { emoji: "⚡" },
  Vampire: { emoji: "🧛" },
};

const DEFAULT_META = { emoji: "🎌" };
const STRIP_LIMIT = 20;

interface GenrePillProps {
  genre: Genre;
  index: number;
}

function GenreCard({ genre, index }: GenrePillProps) {
  const router = useRouter();
  const meta = GENRE_META[genre.name] ?? DEFAULT_META;

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() =>
        router.push(`/results?genre=${genre.id}&name=${encodeURIComponent(genre.name)}`)
      }
      aria-label={`Browse ${genre.name} anime`}
      className="genre-card-btn"
      style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        width: "7.5rem",
        height: "5.5rem",
        borderRadius: "var(--radius-xl)",
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "var(--surface)";
        el.style.borderColor = "var(--accent)";
        el.style.boxShadow = "var(--shadow-hover)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "var(--card)";
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Top-right color dot */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "var(--accent)",
          opacity: 0.8,
          boxShadow: `0 0 6px var(--accent)`,
        }}
      />
      <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{meta.emoji}</span>
      <span style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--primary)",
        textAlign: "center",
        lineHeight: 1.25,
        paddingInline: "0.4rem",
        letterSpacing: "0.01em",
      }}>
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
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
            🎌 Browse by Genre
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--secondary)", marginTop: "0.2rem" }}>
            Click a genre to explore anime
          </p>
        </div>
      </div>

      <div
        className="hide-scrollbar"
        style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "1rem", paddingTop: "0.5rem" }}
      >
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              flexShrink: 0, width: "7.5rem", height: "5.5rem",
              borderRadius: "var(--radius-xl)",
              background: "var(--card)",
              border: "1px solid var(--border)",
              animation: `pulse 1.5s ease-in-out ${i * 0.08}s infinite`,
            }} />
          ))
          : topGenres.map((genre, i) => (
            <GenreCard key={genre.id} genre={genre} index={i} />
          ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
    </section>
  );
}
