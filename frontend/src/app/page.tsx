"use client";

import { useState } from "react";
import { usePopularAnime } from "@/hooks/useAnime";
import type { Anime } from "@/types/anime";
import HeroSlider from "@/components/hero/HeroSlider";
import AnimeSlider from "@/components/anime/AnimeSlider";
import PlaylistModal from "@/components/playlist/PlaylistModal";
import Section from "@/components/shared/Section";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";
import { AlertCircle, TrendingUp, Flame, Award, Clock } from "lucide-react";

// ─── Homepage ─────────────────────────────────────────────────────────────────
// Premium anime discovery homepage with hero carousel and multiple sliders.
// ──────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const {
    heroAnime,
    trendingAnime,
    popularAnime,
    topRatedAnime,
    latestEpisodes,
    isLoading,
    isError,
    error,
  } = usePopularAnime();

  // Playlist modal state
  const [playlistAnime, setPlaylistAnime] = useState<Anime | null>(null);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const handleAddToPlaylist = (anime: Anime) => {
    setPlaylistAnime(anime);
    setPlaylistOpen(true);
  };

  // ── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Discovering anime for you..." />
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<AlertCircle className="w-7 h-7 text-danger" />}
          title="Something went wrong"
          message={
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
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
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <HeroSlider anime={heroAnime} onAddToPlaylist={handleAddToPlaylist} />

      {/* ── Trending Anime ───────────────────────────────────────────────── */}
      <Section>
        <AnimeSlider
          title="🔥 Trending Now"
          data={trendingAnime}
          viewAllLink="#"
          onAddToPlaylist={handleAddToPlaylist}
        />
      </Section>

      {/* ── Popular Anime ────────────────────────────────────────────────── */}
      <Section className="bg-surface">
        <AnimeSlider
          title="⭐ Popular This Season"
          data={popularAnime}
          viewAllLink="#"
          onAddToPlaylist={handleAddToPlaylist}
        />
      </Section>

      {/* ── Top Rated ────────────────────────────────────────────────────── */}
      <Section>
        <AnimeSlider
          title="🏆 Top Rated"
          data={topRatedAnime}
          viewAllLink="#"
          onAddToPlaylist={handleAddToPlaylist}
        />
      </Section>

      {/* ── Latest Episodes ──────────────────────────────────────────────── */}
      {latestEpisodes.length > 0 && (
        <Section className="bg-surface">
          <AnimeSlider
            title="📺 Latest Episodes"
            data={latestEpisodes}
            viewAllLink="#"
            onAddToPlaylist={handleAddToPlaylist}
          />
        </Section>
      )}

      {/* ── Playlist Modal ───────────────────────────────────────────────── */}
      <PlaylistModal
        isOpen={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        anime={playlistAnime}
      />
    </div>
  );
}
