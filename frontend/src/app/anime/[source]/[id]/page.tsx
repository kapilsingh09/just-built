"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Tv, Calendar, Clock, Film, ChevronLeft,
  Play, BookmarkPlus, AlertCircle,
} from "lucide-react";
import { useAnimeDetail, useAnimeEpisodes } from "@/hooks/useAnimeDetail";
import type { Episode } from "@/types/anime";

// ─────────────────────────────────────────────────────────────────────────────
// /anime/[source]/[id] — Anime Detail Page
//
// Receives the `source` ("jikan" | "kitsu") and `id` from the URL params.
// The source tells the hooks which backend route to call.
//
// Sections on this page:
//  1. Hero banner       — blurred bg, poster, title, score, meta tags, synopsis
//  2. Info grid         — genres, studios, rating, type, status, year
//  3. Episode list      — episode cards with number, title, airdate
//
// TODO: WIRE UP "Watch Now" button to an actual streaming source or episode.
// TODO: ADD real "Add to List" functionality when user accounts are ready.
// ─────────────────────────────────────────────────────────────────────────────

interface PageParams {
  source: "jikan" | "kitsu";
  id:     string;
}

// ── Episode Card ──────────────────────────────────────────────────────────────
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
            <span className="text-2xl font-black text-white/30">
              {ep.number ?? index + 1}
            </span>
          </div>
        )}
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Play className="w-5 h-5 text-white" fill="currentColor" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-white/40">EP {ep.number ?? index + 1}</span>
          {ep.duration && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {ep.duration} min
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-white line-clamp-1">
          {ep.title ?? `Episode ${ep.number ?? index + 1}`}
        </p>
        {ep.airdate && (
          <p className="text-xs text-white/40 mt-1">{ep.airdate}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnimeDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  // Next.js 15 — params is a Promise, unwrap with use()
  const { source, id } = use(params);

  const { data: anime,    isLoading: detailLoading, isError: detailError }   = useAnimeDetail(source, id);
  const { episodes,       isLoading: epLoading,     isError: epError       } = useAnimeEpisodes(source, id);

  // ── Loading state ─────────────────────────────────────────────────────────
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

  // ── Error state ───────────────────────────────────────────────────────────
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
          Full-width blurred background + sharp poster + all key info.
          ════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full min-h-[80vh] flex items-end overflow-hidden">

        {/* Blurred BG layer */}
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
            {/* dark gradient from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111]/80 via-transparent to-transparent" />
          </>
        )}

        {/* Back button */}
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

          {/* Text info */}
          <div className="flex-1 min-w-0">
            {/* Meta tags row */}
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

            {/* Synopsis */}
            {anime.synopsis && (
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl mb-6 line-clamp-4">
                {anime.synopsis}
              </p>
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

              {/* Trailer link — only shown if Jikan provides one */}
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
          Genres, studios, rating, duration in a clean pill-grid layout.
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
              {/* Studios — only Jikan fills this */}
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
          Scrollable episode cards. Page 1 only for now.
          TODO: Add "Load More" button or infinite scroll here.
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Episodes</h2>
          {/*
            ╔══════════════════════════════════════════════════════════════╗
            ║  TODO: PAGINATION — ADD "Load More" BUTTON HERE             ║
            ║  Check pagination.hasNextPage from useAnimeEpisodes and     ║
            ║  display a button to fetch the next page.                   ║
            ╚══════════════════════════════════════════════════════════════╝
          */}
        </div>

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

        {!epLoading && episodes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {episodes.map((ep, i) => (
              <EpisodeCard key={ep.id ?? i} ep={ep} index={i} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
