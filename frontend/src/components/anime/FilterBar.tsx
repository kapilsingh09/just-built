"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import type { AnimeFilters } from "@/hooks/useGenre";

// ─── FilterBar ────────────────────────────────────────────────────────────────
// Glassmorphism filter bar with chip-style selects for Sort, Status, and Type.
// Used on the /results page and anywhere else results are shown.
// ──────────────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  filters: AnimeFilters;
  onChange: (next: AnimeFilters) => void;
  totalCount?: number;
}

const SORT_OPTIONS = [
  { value: "score", label: "Top Rated" },
  { value: "popularity", label: "Popularity" },
  { value: "latest", label: "Latest" },
  { value: "title", label: "A–Z Title" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "airing", label: "Airing" },
  { value: "complete", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
  { value: "special", label: "Special" },
  { value: "ona", label: "ONA" },
];

interface ChipSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function ChipSelect({ label, value, options, onChange }: ChipSelectProps) {
  const isActive = !!value && value !== options[0]?.value; // non-default = active

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          background: isActive
            ? "linear-gradient(135deg, rgba(244,117,33,0.25), rgba(229,116,41,0.15))"
            : "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
          border: `1px solid ${isActive ? "rgba(244,117,33,0.5)" : "rgba(255,255,255,0.12)"}`,
          borderRadius: "var(--radius-full)",
          padding: "0.45rem 2.25rem 0.45rem 0.9rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.25s",
          whiteSpace: "nowrap",
          minWidth: "7rem",
          boxShadow: isActive
            ? "0 4px 16px rgba(244,117,33,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}
            style={{ background: "#1c1c1e", color: "#fff" }}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        style={{
          position: "absolute",
          right: "0.6rem",
          top: "50%",
          transform: "translateY(-50%)",
          width: "0.875rem",
          height: "0.875rem",
          color: isActive ? "rgba(244,117,33,0.9)" : "rgba(255,255,255,0.4)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function FilterBar({ filters, onChange, totalCount }: FilterBarProps) {
  const hasActiveFilters =
    (filters.status !== "" && filters.status !== STATUS_OPTIONS[0].value) ||
    (filters.type !== "" && filters.type !== TYPE_OPTIONS[0].value) ||
    filters.sort !== "score";

  const reset = () => onChange({ sort: "score", status: "", type: "" });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.6rem",
        padding: "0.875rem 1.25rem",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "var(--radius-xl)",
        marginBottom: "2rem",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Icon + label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        color: "rgba(255,255,255,0.45)",
        fontSize: "0.8125rem",
        fontWeight: 700,
        marginRight: "0.25rem",
        letterSpacing: "0.02em",
      }}>
        <SlidersHorizontal style={{ width: "0.875rem", height: "0.875rem" }} />
        Filter
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "1.125rem", background: "rgba(255,255,255,0.1)" }} />

      <ChipSelect label="Sort" value={filters.sort} options={SORT_OPTIONS} onChange={(v) => onChange({ ...filters, sort: v })} />
      <ChipSelect label="Status" value={filters.status} options={STATUS_OPTIONS} onChange={(v) => onChange({ ...filters, status: v })} />
      <ChipSelect label="Type" value={filters.type} options={TYPE_OPTIONS} onChange={(v) => onChange({ ...filters, type: v })} />

      {/* Reset — only when non-default */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={reset}
          aria-label="Reset filters"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            background: "rgba(239,68,68,0.1)",
            backdropFilter: "blur(8px)",
            color: "rgba(239,68,68,0.8)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-full)",
            padding: "0.4rem 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "var(--font-sans)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(239,68,68,0.8)";
          }}
        >
          <X style={{ width: "0.75rem", height: "0.75rem" }} />
          Reset
        </motion.button>
      )}

      {/* Total count — right-aligned */}
      {totalCount != null && totalCount > 0 && (
        <span style={{
          marginLeft: "auto",
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.3)",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}>
          {totalCount.toLocaleString()} titles
        </span>
      )}
    </motion.div>
  );
}
