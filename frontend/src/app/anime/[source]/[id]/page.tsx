"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Tv, Calendar, Clock, Film, ChevronLeft, ChevronDown,
  Play, BookmarkPlus, AlertCircle, Layers, ExternalLink,
} from "lucide-react";
import { useAnimeDetail, useAnimeEpisodes, useAnimeRelations } from "@/hooks/useAnimeDetail";
import type { Episode } from "@/types/anime";

// /anime/[source]/[id] — Anime Detail Page
// Sections:
//  1. Hero banner       — blurred bg, poster, title, score, expandable synopsis
//  2. Info grid         — genres (white pill / black text), studios, rating
//  3. Episode list      — arc tabs (100+ eps), 6 default, blur + Show More
//  4. More from series  — related anime from Jikan relations API


const INITIAL_EP_COUNT = 6;

interface PageParams {
  source: "jikan" | "kitsu";
  id:     string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: group flat episode list into arc groups for long series (100+ eps)
// Strategy: auto-arc every 24 episodes (one cour). Returns single group otherwise.
// TODO: Integrate AniList/AniDB for true arc metadata.
// ─────────────────────────────────────────────────────────────────────────────
function groupEpisodesBySeason(
  episodes: Episode[],
  totalEps: number | null
): { label: string; episodes: Episode[] }[] {
  if (episodes.length === 0) return [];

  const ARC_SIZE = 24;
  if ((totalEps ?? episodes.length) > 100) {
    const groups: { label: string; episodes: Episode[] }[] = [];
    for (let i = 0; i < episodes.length; i += ARC_SIZE) {
      const chunk   = episodes.slice(i, i + ARC_SIZE);
      const startEp = chunk[0].number ?? i + 1;
      const endEp   = chunk[chunk.length - 1].number ?? i + ARC_SIZE;
      groups.push({
        label:    `Arc ${Math.floor(i / ARC_SIZE) + 1}  (Ep ${startEp}–${endEp})`,
        episodes: chunk,
      });
    }
    return groups;
  }

  return [{ label: "Episodes", episodes }];
}

function getYouTubeWatchUrl(url: string | null): string {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    if (urlObj.pathname.startsWith("/embed/")) {
      const videoId = urlObj.pathname.split("/")[2];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url;
  } catch {
    return url;
  }
}

function YouTubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function EpisodeCard({ ep, index }: { ep: Episode; index: number }) {
  return (
    <div className="flex gap-4 items-start p-4 rounded-2xl bg-white/5 border border-white/10
                    hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer">
      {/* Thumbnail or number badge */}
      <div className="flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
        {ep.thumbnail ? (
          <Image src={ep.thumbnail} alt={ep.title ?? `Episode ${ep.number}`}
            fill sizes="80px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl font-black text-white/20">{ep.number ?? index + 1}</span>
          </div>
        )}
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
              <Clock className="w-3 h-3" />{ep.duration} min
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-white line-clamp-1">
          {ep.title ?? `Episode ${ep.number ?? index + 1}`}
        </p>
        {ep.airdate && <p className="text-xs text-white/35 mt-0.5">{ep.airdate}</p>}
      </div>
    </div>
  );
}

function SeasonGroup({ label, episodes, isOnlyGroup }: {
  label:       string;
  episodes:    Episode[];
  isOnlyGroup: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible  = expanded ? episodes : episodes.slice(0, INITIAL_EP_COUNT);
  const hasMore  = episodes.length > INITIAL_EP_COUNT;

  return (
    <div className="mb-10">
      {!isOnlyGroup && (
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-4 h-4 text-[#F47521]" />
          <h3 className="text-base font-bold text-white">{label}</h3>
          <span className="text-xs text-white/40 ml-auto">{episodes.length} episodes</span>
        </div>
      )}

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((ep, i) => <EpisodeCard key={ep.id ?? i} ep={ep} index={i} />)}
        </div>

        {/* Blur fade + Show All button */}
        {hasMore && !expanded && (
          <div className="absolute bottom-0 inset-x-0 h-40 flex flex-col items-center justify-end
                          bg-gradient-to-t from-[#111] via-[#111]/85 to-transparent pointer-events-none">
            <button
              onClick={() => setExpanded(true)}
              className="pointer-events-auto mb-3 flex items-center gap-2 px-6 py-2.5 rounded-full
                         bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold
                         hover:bg-white/20 hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
              Show All {episodes.length} Episodes
            </button>
          </div>
        )}

        {/* Collapse */}
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

const RELATION_COLORS: Record<string, string> = {
  "Sequel":              "bg-blue-500/15 text-blue-300 border-blue-500/25",
  "Prequel":             "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "Side Story":          "bg-green-500/15 text-green-300 border-green-500/25",
  "Parent Story":        "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  "Alternative Version": "bg-pink-500/15 text-pink-300 border-pink-500/25",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AnimeDetailPage({ params }: { params: Promise<PageParams> }) {
  const { source, id } = use(params);

  const { data: anime,    isLoading: detailLoading, isError: detailError } = useAnimeDetail(source, id);
  const { episodes,       isLoading: epLoading,     isError: epError      } = useAnimeEpisodes(source, id);
  const { relations }                                                        = useAnimeRelations(source, id);

  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [activeSeasonIdx,  setActiveSeasonIdx]  = useState(0);

  const seasonGroups = useMemo(
    () => groupEpisodesBySeason(episodes, anime?.episodes ?? null),
    [episodes, anime?.episodes]
  );

  const activeGroup = seasonGroups[activeSeasonIdx] ?? null;
  const hasMultiple = seasonGroups.length > 1;

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
          <Link href="/" className="text-[#F47521] text-sm underline underline-offset-4">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const heroImage = anime.bannerImage ?? anime.image;

  return (
    <div className="min-h-screen bg-[#111]">

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO BANNER
          ════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full min-h-[75vh] flex items-end overflow-hidden">

        {/* Blurred BG */}
        {heroImage && (
          <>
            <Image src={heroImage} alt="" fill priority quality={40} sizes="100vw"
              className="object-cover scale-110 blur-2xl opacity-40" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111]/80 via-transparent to-transparent" />
          </>
        )}

        {/* Back button */}
        <Link href="/"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white
                     transition-colors duration-200 text-sm font-medium">
          <ChevronLeft className="w-5 h-5" />
          Back
        </Link>

        {/* Content — reduced top padding so hero isn't too tall */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-10 pt-16 flex flex-col md:flex-row gap-8 items-end">

          {/* Poster */}
          {anime.image && (
            <div className="flex-shrink-0 w-40 h-56 md:w-48 md:h-68 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image src={anime.image} alt={anime.title ?? ""} width={192} height={272}
                className="object-cover w-full h-full" />
            </div>
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
            {/* Meta tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {anime.type && (
                <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                  <Tv className="w-3 h-3" />{anime.type}
                </span>
              )}
              {anime.score != null && (
                <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                  <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />{anime.score.toFixed(1)}
                </span>
              )}
              {anime.year && (
                <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                  <Calendar className="w-3 h-3" />{anime.year}
                </span>
              )}
              {anime.episodes && (
                <span className="badge-base bg-white/15 backdrop-blur-sm text-white border border-white/20">
                  <Film className="w-3 h-3" />{anime.episodes} eps
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

            {/* Synopsis — expandable with Show More / Show Less */}
            {anime.synopsis && (
              <div className="max-w-2xl mb-6">
                <p className={`text-white/70 text-sm sm:text-base leading-relaxed transition-all duration-500 ${
                  synopsisExpanded ? "" : "line-clamp-3"
                }`}>
                  {anime.synopsis}
                </p>
                {anime.synopsis.length > 200 && (
                  <button
                    onClick={() => setSynopsisExpanded((v) => !v)}
                    className="mt-1.5 text-[#F47521] text-xs font-semibold hover:text-orange-300
                               transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                  >
                    {synopsisExpanded
                      ? <><span>Show Less</span><ChevronDown className="w-3 h-3 rotate-180" /></>
                      : <><span>Show More</span><ChevronDown className="w-3 h-3" /></>}
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
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black
                                 font-semibold text-sm hover:bg-white/90 transition-all duration-200 active:scale-95">
                <Play className="w-4 h-4" fill="currentColor" />
                Watch Now
              </button>

              {/*
                ╔══════════════════════════════════════════════════════════════╗
                ║  TODO: WIRE "Add to List" TO USER PLAYLIST                  ║
                ║  Connect this to the user account system when it's ready.   ║
                ╚══════════════════════════════════════════════════════════════╝
              */}
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur-md
                                 border border-white/25 text-white font-semibold text-sm
                                 hover:bg-white/25 transition-all duration-200 active:scale-95">
                <BookmarkPlus className="w-4 h-4" />
                Add to List
              </button>

              {/* YouTube Trailer button — YouTube red + official icon + ExternalLink arrow */}
              {anime.trailerUrl && (
                <a
                  href={getYouTubeWatchUrl(anime.trailerUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm
                             text-white transition-all duration-200 active:scale-95
                             bg-[#FF0000] hover:bg-[#CC0000] shadow-lg shadow-red-900/30"
                >
                  <YouTubeIcon size={17} />
                  Watch Trailer
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — INFO GRID
          Genre pills: white bg + black text (aesthetic on dark bg)
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Genres — white pill with black text */}
          {anime.genres.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold
                               bg-white text-zinc-900 shadow-sm
                               hover:bg-white/80 transition-colors duration-200 cursor-default"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
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
          ─ 100+ ep series → arc tabs (every 24 eps)
          ─ Default 6 eps shown, black blur + "Show All N Episodes" button
          ─ "Show Less" collapses back to 6

          TODO: Add backend pagination — currently limited to page 1
                (20 eps from Kitsu / 100 from Jikan).
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Episodes
            {anime.episodes && (
              <span className="text-sm font-normal text-white/40">({anime.episodes} total)</span>
            )}
          </h2>
        </div>

        {/* Arc / Season tabs — only for 100+ ep series */}
        {hasMultiple && (
          <div className="flex gap-2 flex-wrap mb-6">
            {seasonGroups.map((group, i) => (
              <button
                key={group.label}
                onClick={() => setActiveSeasonIdx(i)}
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
          <p className="text-white/40 text-sm py-8 text-center">No episode data available for this anime yet.</p>
        )}

        {!epLoading && activeGroup && (
          <SeasonGroup
            key={activeGroup.label}
            label={activeGroup.label}
            episodes={activeGroup.episodes}
            isOnlyGroup={!hasMultiple}
          />
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — MORE FROM THIS SERIES
          Sequels, prequels, side stories from Jikan relations API.
          Only shown for Jikan-sourced anime (Kitsu doesn't provide this).

          NOTE: No ML needed — Jikan's /anime/:id/relations endpoint returns
          this data directly. Just a standard REST API call.
          ════════════════════════════════════════════════════════════════════ */}
      {relations.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-xl font-bold text-white mb-6">More from This Series</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relations.map((rel) => (
              <Link
                key={rel.id}
                href={`/anime/jikan/${rel.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10
                           hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                {/* Relation type badge */}
                <div className="flex-shrink-0">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                    ${RELATION_COLORS[rel.relation] ?? "bg-white/10 text-white/60 border-white/15"}`}>
                    {rel.relation}
                  </span>
                </div>

                {/* Title */}
                <p className="flex-1 text-sm font-medium text-white line-clamp-2 group-hover:text-[#F47521] transition-colors duration-200">
                  {rel.title}
                </p>

                <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/50 flex-shrink-0 transition-colors duration-200" />
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
