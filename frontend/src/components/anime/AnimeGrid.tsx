"use client";

import { motion } from "framer-motion";
import AnimeCard from "./AnimeCard";
import Loader from "@/components/shared/Loader";
import type { Anime } from "@/types/anime";
import { Tv } from "lucide-react";

// ─── AnimeGrid ────────────────────────────────────────────────────────────────
// Reusable responsive flex-wrap grid of AnimeCards.
// Used by: /genre/[id] page, and will be reused for the search results page.
// ──────────────────────────────────────────────────────────────────────────────

interface AnimeGridProps {
  data:          Anime[];
  isLoading?:    boolean;
  totalCount?:   number;
  onAddToPlaylist?: (anime: Anime) => void;
}

const SKELETON_COUNT = 12;

// Stagger animation for grid items
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function AnimeGrid({
  data,
  isLoading = false,
  totalCount,
  onAddToPlaylist,
}: AnimeGridProps) {
  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "flex-start" }}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{
              width:         "var(--card-width)",
              height:        "var(--card-height)",
              borderRadius:  "var(--card-radius)",
              background:    "var(--surface)",
              border:        "1px solid var(--border)",
              flexShrink:    0,
              animation:     `pulse 1.6s ease-in-out ${i * 0.07}s infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50%       { opacity: 1;   }
          }
        `}</style>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!isLoading && data.length === 0) {
    return (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "5rem 1rem",
          gap:            "1rem",
          color:          "var(--secondary)",
        }}
      >
        <Tv style={{ width: "3rem", height: "3rem", opacity: 0.4 }} />
        <p style={{ fontSize: "1rem", fontWeight: 500 }}>No anime found</p>
        <p style={{ fontSize: "0.875rem", opacity: 0.6 }}>Try adjusting your filters</p>
      </div>
    );
  }

  // ── Grid ─────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Result count badge */}
      {totalCount != null && totalCount > 0 && (
        <p
          style={{
            fontSize:    "0.8125rem",
            color:       "var(--secondary)",
            marginBottom: "1.25rem",
            fontWeight:  500,
          }}
        >
          Showing{" "}
          <span style={{ color: "var(--accent)" }}>{data.length}</span>
          {totalCount > data.length && (
            <> of <span style={{ color: "var(--primary)" }}>{totalCount.toLocaleString()}</span></>
          )}{" "}
          results
        </p>
      )}

      {/* Flex-wrap grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display:        "flex",
          flexWrap:       "wrap",
          gap:            "1.5rem",
          justifyContent: "flex-start",
        }}
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
