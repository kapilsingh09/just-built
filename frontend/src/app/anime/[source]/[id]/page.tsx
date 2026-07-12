"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Tv, Calendar, Clock, Film, ChevronLeft, ChevronDown,
  Play, BookmarkPlus, AlertCircle, Layers,
} from "lucide-react";
import { useAnimeDetail, useAnimeEpisodes } from "@/hooks/useAnimeDetail";
import type { Episode } from "@/types/anime";

// ─────────────────────────────────────────────────────────────────────────────
// /anime/[source]/[id] — Anime Detail Page
//
// Sections:
//  1. Hero banner    — blurred bg, poster, title, score, synopsis (expandable)
//  2. Info grid      — genres, studios, rating, type, status, year
//  3. Episode list   — grouped by season, default 6 shown, blur + "Show More"
//
// TODO: WIRE UP "Watch Now" to a streaming source.
// TODO: ADD "Add to List" to user playlist when accounts are ready.
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_EP_COUNT = 6; // episodes visible before "Show More"

interface PageParams {
  source: "jikan" | "kitsu";
  id:     string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: group a flat episode list into seasons.
//
// Strategy (in priority order):
//  1. If any episode has a `seasonNumber` field → group by that.
//  2. Else if total episodes > 100 → auto-group every 24 eps as a "Part" (arc).
//  3. Else → single "Episodes" group (no season UI needed).
//
// NOTE: Jikan and Kitsu don't expose season numbers on episodes —
//       they only expose raw sequential numbers. Arc-splitting (every 24)
//       is the best approximation without a third-party API.
//
// TODO: Integrate AniList or AniDB API for true season/arc metadata.
// ─────────────────────────────────────────────────────────────────────────────
function groupEpisodesBySeason(
  episodes: Episode[],
  totalEps: number | null
): { label: string; episodes: Episode[] }[] {
  if (episodes.length === 0) return [];

  // Case 1: Grouped automatically for very long series (100+ episodes)
  // Split into arcs of ~24 episodes each (roughly one cour)
  const ARC_SIZE = 24;
  if ((totalEps ?? episodes.length) > 100) {
    const groups: { label: string; episodes: Episode[] }[] = [];
    for (let i = 0; i < episodes.length; i += ARC_SIZE) {
      const chunk = episodes.slice(i, i + ARC_SIZE);
      const startEp = chunk[0].number ?? i + 1;
      const endEp   = chunk[chunk.length - 1].number ?? i + ARC_SIZE;
      groups.push({
        label:    `Arc ${Math.floor(i / ARC_SIZE) + 1}  (Ep ${startEp}–${endEp})`,
        episodes: chunk,
      });
    }
    return groups;
  }

  // Case 2: Single group for short / normal series
  return [{ label: "Episodes", episodes }];
}

// ─────────────────────────────────────────────────────────────────────────────
// EpisodeCard — single episode row
// ─────────────────────────────────────────────────────────────────────────────
function EpisodeCard({ ep, index }: { ep: Episode; index: number }) {
  return (
    <div
      className="flex gap-4 items-start p-4 rounded-2xl bg-white/5 border border-white/10
                 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
    >
      {/* Thumbnail or number badge */}
      <div className="flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
        {ep.thumbnail ? (
          <Image
            src={ep.thumbnail}
            alt={ep.title ?? `Episode ${ep.number}`}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl font-black text-white/20">
              {ep.number ?? index + 1}
            </span>
          </div>
        )}
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Play className="w-4 h-4 text-white" fill="currentColor" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono text-white/35">EP {ep.number ?? index + 1}</span>
          {ep.duration && (
            <span className="text-xs text-white/35 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {ep.duration} min
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-white line-clamp-1">
          {ep.title ?? `Episode ${ep.number ?? index + 1}`}
        </p>
        {ep.airdate && (
          <p className="text-xs text-white/35 mt-0.5">{ep.airdate}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SeasonGroup — renders one season/arc of episodes with expand/collapse
// ─────────────────────────────────────────────────────────────────────────────
function SeasonGroup({
  label,
  episodes,
  isOnlyGroup,
}: {
  label:       string;
  episodes:    Episode[];
  isOnlyGroup: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  // Show first 6 episodes by default; rest hidden behind blur
  const visible  = expanded ? episodes : episodes.slice(0, INITIAL_EP_COUNT);
  const hasMore  = episodes.length > INITIAL_EP_COUNT;

  return (
    <div className="mb-10">
      {/* Season header — only show if there are multiple seasons/arcs */}
      {!isOnlyGroup && (
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-4 h-4 text-[#F47521]" />
          <h3 className="text-base font-bold text-white">{label}</h3>
          <span className="text-xs text-white/40 ml-auto">{episodes.length} episodes</span>
        </div>
      )}

      {/* Episode grid */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((ep, i) => (
            <EpisodeCard key={ep.id ?? i} ep={ep} index={i} />
          ))}
        </div>

        {/* ── Blur fade + Show More button ─────────────────────────────────── */}
        {hasMore && !expanded && (
          <div className="absolute bottom-0 inset-x-0 h-36 flex flex-col items-center justify-end
                          bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent pointer-events-none">
            {/* Show More button (pointer-events re-enabled) */}
            <button
              onClick={() => setExpanded(true)}
              className="pointer-events-auto mb-2 flex items-center gap-2 px-6 py-2.5 rounded-full
                         bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold
                         hover:bg-white/20 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
              Show All {episodes.length} Episodes
            </button>
          </div>
        )}

        {/* Collapse button when expanded */}
        {expanded && hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full
                         bg-white/5 border border-white/15 text-white/60 text-sm
                         hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
              Show Less
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AnimeDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { source, id } = use(params);

  const { data: anime,    isLoading: detailLoading, isError: detailError } = useAnimeDetail(source, id);
  const { episodes,       isLoading: epLoading,     isError: epError      } = useAnimeEpisodes(source, id);

  // Synopsis expand state
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  // Season tab state — which arc/season tab is selected
  const [activeSeasonIdx, setActiveSeasonIdx] = useState(0);

  // Build season groups
  const seasonGroups = useMemo(
    () => groupEpisodesBySeason(episodes, anime?.episodes ?? null),
    [episodes, anime?.episodes]
  );

  const activeGroup  = seasonGroups[activeSeasonIdx] ?? null;
  const hasMultiple  = seasonGroups.length > 1;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (detailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[#F47521] animate-spin" />
          <p className="text-white/50 text-sm">Loading anime details…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (detailError || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h1 className="text-xl font-bold text-white">Anime not found</h1>
          <p className="text-white/50 text-sm">We couldn&apos;t load this anime. Try going back.</p>
          <Link href="/" className="text-[#F47521] text-sm underline underline-offset-4">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = anime.bannerImage ?? anime.image;

  return (
    <div className="min-h-screen bg-[#111]">

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO BANNER
          Full-width blurred background + sharp poster + expandable synopsis.
          ════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full min-h-[80vh] flex items-end overflow-hidden">

        {/* Blurred BG */}
        {heroImage && (
          <>
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              quality={40}
              sizes="100vw"
              className="object-cover scale-110 blur-2xl opacity-40"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111]/80 via-transparent to-transparent" />
          </>
        )}

        {/* Back */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white
                     transition-colors duration-200 text-sm font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </Link>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12 pt-24 flex flex-col md:flex-row gap-8 items-end">

          {/* Poster */}
          {anime.image && (
            <div className="flex-shrink-0 w-44 h-64 md:w-52 md:h-76 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={anime.image}
                alt={anime.title ?? ""}
                width={208}
                height={300}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
            {/* Meta tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {anime.type && (
                <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                  <Tv className="w-3 h-3" />
                  {anime.type}
                </span>
              )}
              {anime.score != null && (
                <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                  <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  {anime.score.toFixed(1)}
                </span>
              )}
              {anime.year && (
                <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                  <Calendar className="w-3 h-3" />
                  {anime.year}
                </span>
              )}
              {anime.episodes && (
                <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                  <Film className="w-3 h-3" />
                  {anime.episodes} eps
                </span>
              )}
              {anime.status && (
                <span className={`badge-base text-xs ${
                  anime.status.toLowerCase().includes("current") || anime.status.toLowerCase().includes("airing")
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-white/10 text-white/70 border border-white/15"
                }`}>
                  {anime.status}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
              {anime.title}
            </h1>

            {/* Synopsis — expandable */}
            {anime.synopsis && (
              <div className="max-w-2xl mb-6">
                <p className={`text-white/70 text-sm sm:text-base leading-relaxed transition-all duration-500 ${
                  synopsisExpanded ? "" : "line-clamp-3"
                }`}>
                  {anime.synopsis}
                </p>
                {/* Only show toggle if text is long enough to clip */}
                {anime.synopsis.length > 200 && (
                  <button
                    onClick={() => setSynopsisExpanded((v) => !v)}
                    className="mt-2 text-[#F47521] text-xs font-semibold hover:text-orange-300
                               transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                  >
                    {synopsisExpanded ? (
                      <>Show Less <ChevronDown className="w-3 h-3 rotate-180" /></>
                    ) : (
                      <>Show More <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/*
                ╔══════════════════════════════════════════════════════════════╗
                ║  TODO: WIRE "Watch Now" TO A STREAMING SOURCE               ║
                ║  Right now this button does nothing. When you integrate a   ║
                ║  streaming API or external link, update the href here.      ║
                ╚══════════════════════════════════════════════════════════════╝
              */}
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black
                           font-semibold text-sm hover:bg-white/90 transition-all duration-200 active:scale-95"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Watch Now
              </button>

              {/*
                ╔══════════════════════════════════════════════════════════════╗
                ║  TODO: WIRE "Add to List" TO USER PLAYLIST                  ║
                ║  Connect this to the user account system when it's ready.   ║
                ╚══════════════════════════════════════════════════════════════╝
              */}
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur-md
                           border border-white/25 text-white font-semibold text-sm
                           hover:bg-white/25 transition-all duration-200 active:scale-95"
              >
                <BookmarkPlus className="w-4 h-4" />
                Add to List
              </button>

              {anime.trailerUrl && (
                <a
                  href={anime.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600/80 backdrop-blur-md
                             border border-red-500/40 text-white font-semibold text-sm
                             hover:bg-red-600 transition-all duration-200 active:scale-95"
                >
                  <Play className="w-4 h-4" />
                  Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — INFO GRID
          Genres, studios, rating, duration in pill-grid layout.
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Genres */}
          {anime.genres.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F47521]/15 text-[#F47521]
                               border border-[#F47521]/25"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick info */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Details</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {anime.rating && (
                <div className="flex gap-2">
                  <span className="text-white/40">Rating</span>
                  <span className="text-white font-medium">{anime.rating}</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex gap-2">
                  <span className="text-white/40">Duration</span>
                  <span className="text-white font-medium">{anime.duration}</span>
                </div>
              )}
              {anime.season && (
                <div className="flex gap-2">
                  <span className="text-white/40">Season</span>
                  <span className="text-white font-medium capitalize">{anime.season}</span>
                </div>
              )}
              {anime.studios && anime.studios.length > 0 && (
                <div className="flex gap-2 col-span-2">
                  <span className="text-white/40">Studios</span>
                  <span className="text-white font-medium">{anime.studios.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — EPISODE LIST
          ─ If series > 100 eps  → split into Arc tabs (every 24 eps)
          ─ Otherwise            → single group
          ─ Each group shows 6 by default, blur + "Show All N Episodes"
          ─ "Show Less" collapses back to 6

          TODO: Add proper pagination to fetch more episodes from the backend.
                Currently limited to 20 episodes from Kitsu / 100 from Jikan page 1.
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 pb-20">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Episodes
            {anime.episodes && (
              <span className="text-sm font-normal text-white/40">
                ({anime.episodes} total)
              </span>
            )}
          </h2>
        </div>

        {/* ── Arc / Season tabs (only for 100+ ep series) ────────────────── */}
        {hasMultiple && (
          <div className="flex gap-2 flex-wrap mb-6">
            {seasonGroups.map((group, i) => (
              <button
                key={group.label}
                onClick={() => { setActiveSeasonIdx(i); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border
                  ${activeSeasonIdx === i
                    ? "bg-[#F47521] text-white border-[#F47521]"
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading / Error / Empty ──────────────────────────────────────── */}
        {epLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-[#F47521] animate-spin" />
          </div>
        )}

        {epError && (
          <div className="flex items-center gap-3 text-white/50 py-8">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">Couldn&apos;t load episodes for this anime.</p>
          </div>
        )}

        {!epLoading && !epError && episodes.length === 0 && (
          <p className="text-white/40 text-sm py-8 text-center">
            No episode data available for this anime yet.
          </p>
        )}

        {/* ── Active season/arc group ──────────────────────────────────────── */}
        {!epLoading && activeGroup && (
          <SeasonGroup
            key={activeGroup.label}      // remount when switching arcs → resets expand state
            label={activeGroup.label}
            episodes={activeGroup.episodes}
            isOnlyGroup={!hasMultiple}
          />
        )}

      </div>
    </div>
  );
}
