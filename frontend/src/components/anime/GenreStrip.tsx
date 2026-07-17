"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useJikanGenres } from "@/hooks/useGenre";
import type { Genre } from "@/hooks/useGenre";

// ─── GenreStrip ───────────────────────────────────────────────────────────────
// Horizontal scrollable strip of glassmorphism genre cards.
// Clicking a genre navigates to /results?genre=<id>&name=<name>
// ──────────────────────────────────────────────────────────────────────────────

const GENRE_META: Record<string, { emoji: string; color: string }> = {
  Action: { emoji: "⚔️", color: "#ef4444" },
  Adventure: { emoji: "🗺️", color: "#f97316" },
  Comedy: { emoji: "😂", color: "#eab308" },
  Drama: { emoji: "🎭", color: "#8b5cf6" },
  Fantasy: { emoji: "🧙", color: "#06b6d4" },
  Horror: { emoji: "👻", color: "#6b7280" },
  Mystery: { emoji: "🔍", color: "#3b82f6" },
  Romance: { emoji: "💕", color: "#ec4899" },
  "Sci-Fi": { emoji: "🚀", color: "#14b8a6" },
  "Slice of Life": { emoji: "🌸", color: "#f472b6" },
  Sports: { emoji: "⚽", color: "#22c55e" },
  Supernatural: { emoji: "✨", color: "#a855f7" },
  Thriller: { emoji: "😱", color: "#64748b" },
  Mecha: { emoji: "🤖", color: "#0ea5e9" },
  Music: { emoji: "🎵", color: "#f59e0b" },
  Psychological: { emoji: "🧠", color: "#7c3aed" },
  Historical: { emoji: "📜", color: "#92400e" },
  Military: { emoji: "🎖️", color: "#4b5563" },
  Demons: { emoji: "😈", color: "#dc2626" },
  Isekai: { emoji: "🌀", color: "#10b981" },
  "Martial Arts": { emoji: "🥋", color: "#f59e0b" },
  Magic: { emoji: "🪄", color: "#c084fc" },
  School: { emoji: "🏫", color: "#60a5fa" },
  "Super Power": { emoji: "⚡", color: "#facc15" },
  Vampire: { emoji: "🧛", color: "#9f1239" },
};

const DEFAULT_META = { emoji: "🎌", color: "#F47521" };
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
      whileHover={{ scale: 1.07, y: -4 }}
      whileTap={{ scale: 0.94 }}
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
        gap: "0.45rem",
        width: "7rem",
        height: "5.25rem",
        borderRadius: "1.125rem",
        // Glassmorphism
        background: `linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid rgba(255,255,255,0.10)`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)`,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 300ms cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = `linear-gradient(135deg, ${meta.color}28, ${meta.color}12)`;
        el.style.borderColor = `${meta.color}50`;
        el.style.boxShadow = `0 8px 28px ${meta.color}30, inset 0 1px 0 rgba(255,255,255,0.12)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = `linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))`;
        el.style.borderColor = `rgba(255,255,255,0.10)`;
        el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)`;
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
          background: meta.color,
          opacity: 0.7,
          boxShadow: `0 0 6px ${meta.color}`,
        }}
      />
      <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{meta.emoji}</span>
      <span style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        color: "#fff",
        textAlign: "center",
        lineHeight: 1.25,
        paddingInline: "0.3rem",
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
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            🎌 Browse by Genre
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--secondary)", marginTop: "0.2rem" }}>
            Click a genre to explore anime
          </p>
        </div>
      </div>

      <div
        className="hide-scrollbar"
        style={{ display: "flex", gap: "0.6rem", overflowX: "auto", paddingBottom: "0.5rem" }}
      >
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              flexShrink: 0, width: "7rem", height: "5.25rem",
              borderRadius: "1.125rem",
              background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.08)",
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
