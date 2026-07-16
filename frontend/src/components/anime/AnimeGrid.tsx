"use client";

import { motion } from "framer-motion";
import AnimeCard from "./AnimeCard";
import type { Anime } from "@/types/anime";
import { Tv } from "lucide-react";

// ─── AnimeGrid ────────────────────────────────────────────────────────────────
// Reusable flex-wrap results grid of AnimeCards.
// Works on both dark (#111) results pages and surface (--surface) pages.
// Used by: /results (genre & search), /explore
// ──────────────────────────────────────────────────────────────────────────────

interface AnimeGridProps {
  data: Anime[];
  isLoading?: boolean;
  totalCount?: number;
  onAddToPlaylist?: (anime: Anime) => void;
}

const SKELETON_COUNT = 12;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: "easeOut" } },
};

export default function AnimeGrid({ data, isLoading = false, totalCount, onAddToPlaylist }: AnimeGridProps) {

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <style>{`@keyframes shimmer{0%,100%{opacity:.35}50%{opacity:.7}}`}</style>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "var(--card-width)",
                height: "var(--card-height)",
                borderRadius: "var(--card-radius)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
                animation: `shimmer 1.6s ease-in-out ${i * 0.065}s infinite`,
              }}
            />
          ))}
        </div>
      </>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "6rem 1rem", gap: "1rem",
        color: "rgba(255,255,255,0.4)",
      }}>
        <div style={{
          width: "4rem", height: "4rem", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Tv style={{ width: "1.5rem", height: "1.5rem", opacity: 0.5 }} />
        </div>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>No anime found</p>
        <p style={{ fontSize: "0.875rem", opacity: 0.5 }}>Try adjusting your filters</p>
      </div>
    );
  }

  // ── Grid ─────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Result count */}
      {totalCount != null && totalCount > 0 && (
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.25rem", fontWeight: 600 }}>
          Showing <span style={{ color: "var(--accent)" }}>{data.length}</span>
          {totalCount > data.length && (
            <> of <span style={{ color: "rgba(255,255,255,0.7)" }}>{totalCount.toLocaleString()}</span></>
          )}{" "}results
        </p>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", justifyContent: "flex-start" }}
      >
        {data.map((anime) => (
          <motion.div key={`${anime.source}-${anime.id}`} variants={itemVariants}>
            <AnimeCard anime={anime} onAddToPlaylist={onAddToPlaylist} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
