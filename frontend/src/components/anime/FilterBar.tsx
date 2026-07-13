"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import type { AnimeFilters } from "@/hooks/useGenre";

// ─── FilterBar ────────────────────────────────────────────────────────────────
// Compact filter bar with chip-style selects for Sort, Status, and Type.
// Matches the globals.css design system — uses CSS variables throughout.
// ──────────────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  filters:   AnimeFilters;
  onChange:  (next: AnimeFilters) => void;
  totalCount?: number;
}

const SORT_OPTIONS = [
  { value: "score",      label: "Top Rated"  },
  { value: "popularity", label: "Popularity" },
  { value: "latest",     label: "Latest"     },
  { value: "title",      label: "A–Z Title"  },
];

const STATUS_OPTIONS = [
  { value: "",         label: "All Status"  },
  { value: "airing",   label: "Airing"      },
  { value: "complete", label: "Completed"   },
  { value: "upcoming", label: "Upcoming"    },
];

const TYPE_OPTIONS = [
  { value: "",        label: "All Types" },
  { value: "tv",      label: "TV"        },
  { value: "movie",   label: "Movie"     },
  { value: "ova",     label: "OVA"       },
  { value: "special", label: "Special"   },
  { value: "ona",     label: "ONA"       },
];

// ─── Reusable chip select ─────────────────────────────────────────────────────
interface ChipSelectProps {
  label:    string;
  value:    string;
  options:  { value: string; label: string }[];
  onChange: (v: string) => void;
}

function ChipSelect({ label, value, options, onChange }: ChipSelectProps) {
  const isActive = !!value;
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{
          appearance:      "none",
          WebkitAppearance: "none",
          background:      isActive ? "var(--accent)" : "var(--surface)",
          color:           isActive ? "#fff"          : "var(--secondary)",
          border:          `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
          borderRadius:    "var(--radius-full)",
          padding:         "0.4rem 2.2rem 0.4rem 0.875rem",
          fontSize:        "0.8125rem",
          fontWeight:      600,
          fontFamily:      "var(--font-sans)",
          cursor:          "pointer",
          outline:         "none",
          transition:      "all var(--transition-fast)",
          whiteSpace:      "nowrap",
          minWidth:        "6rem",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "var(--surface)", color: "var(--primary)" }}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Chevron icon overlay */}
      <ChevronDown
        style={{
          position:   "absolute",
          right:      "0.55rem",
          top:        "50%",
          transform:  "translateY(-50%)",
          width:      "0.875rem",
          height:     "0.875rem",
          color:      isActive ? "#fff" : "var(--secondary)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
export default function FilterBar({ filters, onChange, totalCount }: FilterBarProps) {
  const hasActiveFilters =
    filters.status !== "" || filters.type !== "" || filters.sort !== "score";

  const reset = () => onChange({ sort: "score", status: "", type: "" });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y:  0 }}
      transition={{ duration: 0.3 }}
      style={{
        display:        "flex",
        alignItems:     "center",
        flexWrap:       "wrap",
        gap:            "0.625rem",
        padding:        "0.875rem 1.25rem",
        background:     "var(--surface)",
        border:         "1px solid var(--border)",
        borderRadius:   "var(--radius-xl)",
        marginBottom:   "2rem",
      }}
    >
      {/* Icon + label */}
      <div
        style={{
          display:     "flex",
          alignItems:  "center",
          gap:         "0.375rem",
          marginRight: "0.25rem",
          color:       "var(--secondary)",
          fontSize:    "0.8125rem",
          fontWeight:  600,
        }}
      >
        <SlidersHorizontal style={{ width: "0.9rem", height: "0.9rem" }} />
        Filter
      </div>

      {/* Divider */}
      <div
        style={{
          width:      "1px",
          height:     "1.25rem",
          background: "var(--border)",
          marginRight: "0.25rem",
        }}
      />

      {/* Sort */}
      <ChipSelect
        label="Sort"
        value={filters.sort}
        options={SORT_OPTIONS}
        onChange={(v) => onChange({ ...filters, sort: v })}
      />

      {/* Status */}
      <ChipSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange({ ...filters, status: v })}
      />

      {/* Type */}
      <ChipSelect
        label="Type"
        value={filters.type}
        options={TYPE_OPTIONS}
        onChange={(v) => onChange({ ...filters, type: v })}
      />

      {/* Reset button — only shown when filters are non-default */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={reset}
          aria-label="Reset filters"
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "0.25rem",
            background:   "transparent",
            color:        "var(--secondary)",
            border:       "1px solid var(--border)",
            borderRadius: "var(--radius-full)",
            padding:      "0.4rem 0.75rem",
            fontSize:     "0.75rem",
            fontWeight:   600,
            cursor:       "pointer",
            transition:   "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--secondary)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          }}
        >
          <X style={{ width: "0.75rem", height: "0.75rem" }} />
          Reset
        </motion.button>
      )}

      {/* Spacer + count */}
      {totalCount != null && totalCount > 0 && (
        <span
          style={{
            marginLeft:   "auto",
            fontSize:     "0.75rem",
            color:        "var(--secondary)",
            fontWeight:   500,
            whiteSpace:   "nowrap",
          }}
        >
          {totalCount.toLocaleString()} titles
        </span>
      )}
    </motion.div>
  );
}
