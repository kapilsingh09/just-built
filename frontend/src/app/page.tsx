"use client";

import { useState } from "react";
import {
  useJikanPopular,
  useKitsuPopular,
  useKitsuTopRated,
  useKitsuLatest,
  useKitsuSeasonal,
} from "@/hooks/useAnime";
import type { Anime } from "@/types/anime";
import HeroSlider from "@/components/hero/HeroSlider";
import AnimeSlider from "@/components/anime/AnimeSlider";
import GenreStrip from "@/components/anime/GenreStrip";
import PlaylistModal from "@/components/playlist/PlaylistModal";
import Section from "@/components/shared/Section";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";
import { AlertCircle } from "lucide-react";

// ─── Homepage ─────────────────────────────────────────────────────────────────
// Each slider is powered by its own named hook → its own backend route.
// Section subtitles show exactly which route is being called.
// ──────────────────────────────────────────────────────────────────────────────

export default function Home() {
  // ── Data hooks — one per backend route ────────────────────────────────────
  const jikanPopular  = useJikanPopular();    // GET /api/jikan/popular
  const kitsuPopular  = useKitsuPopular();    // GET /api/anime/popular
  const kitsuTopRated = useKitsuTopRated();   // GET /api/anime/top-rated
  const kitsuLatest   = useKitsuLatest();     // GET /api/anime/latest
  const kitsuSeasonal = useKitsuSeasonal();   // GET /api/anime/seasonal

  // ── Playlist modal ────────────────────────────────────────────────────────
  const [playlistAnime, setPlaylistAnime] = useState<Anime | null>(null);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const handleAddToPlaylist = (anime: Anime) => {
    setPlaylistAnime(anime);
    setPlaylistOpen(true);
  };

  // Hero uses seasonal popular — anime airing this season, sorted by fans
  const heroAnime = kitsuSeasonal.data.length > 0
    ? kitsuSeasonal.data
    : kitsuPopular.data; // fallback if seasonal is empty

  // ── Global loading — wait for the two most important sections ─────────────
  const coreLoading = jikanPopular.isLoading || kitsuPopular.isLoading || kitsuSeasonal.isLoading;
  const anyError = jikanPopular.isError || kitsuPopular.isError;
  const firstError = jikanPopular.error || kitsuPopular.error;

  if (coreLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Discovering anime for you..." />
      </div>
    );
  }

  if (anyError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<AlertCircle className="w-7 h-7 text-danger" />}
          title="Something went wrong"
          message={
            (firstError as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ??
            "Failed to load anime. Make sure your backend and Redis are running."
          }
          action={
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-accent hover:text-accent-secondary underline underline-offset-4 transition-colors cursor-pointer"
            >
              Try again
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {/* Powered by: GET /api/anime/popular (Kitsu) */}
      <HeroSlider anime={heroAnime} onAddToPlaylist={handleAddToPlaylist} />

      {/* ── Genre Strip ───────────────────────────────────────────────────
          A horizontal scrollable strip of clickable genre pills.          */}
      <Section className="bg-zinc-900 !py-6 md:!py-8">
        <div className="container-main">
          <GenreStrip />
        </div>
      </Section>

      {/* ── Trending on MAL ───────────────────────────────────────────────
          Route:  GET /api/jikan/popular
          Source: Jikan API (MyAnimeList) — airing anime ranked by score  */}
      <Section className="bg-zinc-900 !py-6 md:!py-8">
        <AnimeSlider
          title="🔥 Trending on MAL"
          subtitle={jikanPopular.route}
          data={jikanPopular.data}
          viewAllLink="#"
          onAddToPlaylist={handleAddToPlaylist}
        />
      </Section>

      {/* ── Popular on Kitsu ──────────────────────────────────────────────
          Route:  GET /api/anime/popular
          Source: Kitsu API — sorted by -userCount (most followed)        */}
      <Section className="bg-zinc-900 !py-6 md:!py-8">
        <AnimeSlider
          title="⭐ Popular on Kitsu"
          subtitle={kitsuPopular.route}
          data={kitsuPopular.data}
          viewAllLink="#"
          onAddToPlaylist={handleAddToPlaylist}
        />
      </Section>

      {/* ── Top Rated ─────────────────────────────────────────────────────
          Route:  GET /api/anime/top-rated
          Source: Kitsu API — sorted by -averageRating                    */}
      <Section className="bg-zinc-900 !py-6 md:!py-8">
        <AnimeSlider
          title="🏆 Top Rated"
          subtitle={kitsuTopRated.route}
          data={kitsuTopRated.data}
          viewAllLink="#"
          onAddToPlaylist={handleAddToPlaylist}
        />
      </Section>

      {/* ── Latest Releases ───────────────────────────────────────────────
          Route:  GET /api/anime/latest
          Source: Kitsu API — sorted by -startDate                        */}
      <Section className="bg-zinc-900 !py-6 md:!py-8">
        <AnimeSlider
          title="📺 Latest Releases"
          subtitle={kitsuLatest.route}
          data={kitsuLatest.data}
          viewAllLink="#"
          onAddToPlaylist={handleAddToPlaylist}
        />
      </Section>

      {/* ── Playlist Modal ────────────────────────────────────────────────── */}
      <PlaylistModal
        isOpen={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        anime={playlistAnime}
      />
    </div>
  );
}
