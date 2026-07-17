"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useJikanGenres } from "@/hooks/useGenre";
import type { Genre } from "@/hooks/useGenre";

// ─── GenreStrip ───────────────────────────────────────────────────────────────
// Flex-wrapped list of genre tags (document-style pills).
// Clicking a genre navigates to /results?genre=<id>&name=<name>
// ──────────────────────────────────────────────────────────────────────────────

interface GenrePillProps {
  genre: Genre;
  index: number;
}

function GenreCard({ genre, index }: GenrePillProps) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.02, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() =>
        router.push(`/results?genre=${genre.id}&name=${encodeURIComponent(genre.name)}`)
      }
      aria-label={`Browse ${genre.name} anime`}
      className="genre-card-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem 1rem",
        borderRadius: "var(--radius-full)",
        background: "var(--card)",
        border: "1px solid var(--border)",
        color: "var(--primary)",
        fontSize: "0.85rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "var(--accent)";
        el.style.borderColor = "var(--accent)";
        el.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "var(--card)";
        el.style.borderColor = "var(--border)";
        el.style.color = "var(--primary)";
      }}
    >
      {genre.name}
    </motion.button>
  );
}

// ─── GenreStrip ───────────────────────────────────────────────────────────────
export default function GenreStrip() {
  const { genres, isLoading } = useJikanGenres();
  // Show a good amount of genres since it's wrapped now.
  // We'll show all of them if there aren't too many, or slice if preferred.
  // We'll slice to 30 just to be safe, but typically tags take less space.
  const topGenres = genres.slice(0, 30);

  return (
    <section aria-label="Browse by genre">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
            Browse by Genre
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--secondary)", marginTop: "0.2rem" }}>
            Click a genre to explore anime
          </p>
        </div>
      </div>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", paddingBottom: "1rem" }}
      >
        {isLoading
          ? Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{
              width: "6rem", height: "2.2rem",
              borderRadius: "var(--radius-full)",
              background: "var(--card)",
              border: "1px solid var(--border)",
              animation: `pulse 1.5s ease-in-out ${i * 0.05}s infinite`,
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
  