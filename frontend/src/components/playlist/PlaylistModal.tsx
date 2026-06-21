"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Music, Heart, Zap, Film } from "lucide-react";
import type { Anime, Playlist } from "@/types/anime";
import Button from "../buttons/Button";

// ─── PlaylistModal ────────────────────────────────────────────────────────────
// UI-only modal for saving anime to playlists. No backend logic.
// ──────────────────────────────────────────────────────────────────────────────

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: Anime | null;
}

// Mock playlist data for UI demonstration
const mockPlaylists: Playlist[] = [
  { id: "1", name: "Watch Later", animeCount: 12 },
  { id: "2", name: "Favorites", animeCount: 8 },
  { id: "3", name: "Action Picks", animeCount: 5 },
  { id: "4", name: "Weekend Binge", animeCount: 15 },
];

const playlistIcons = [Film, Heart, Zap, Music];

export default function PlaylistModal({
  isOpen,
  onClose,
  anime,
}: PlaylistModalProps) {
  const [saved, setSaved] = useState<string | null>(null);

  const handleSave = (playlistId: string) => {
    setSaved(playlistId);
    setTimeout(() => {
      setSaved(null);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-md"
            initial={{ opacity: 0, y: 20, x: "-50%", translateY: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%", translateY: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%", translateY: "-50%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-primary">
                    Save to Playlist
                  </h3>
                  {anime && (
                    <p className="text-sm text-secondary mt-0.5 line-clamp-1">
                      {anime.title}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center
                             text-secondary hover:text-primary hover:bg-border/50
                             transition-all duration-200 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Playlist List */}
              <div className="p-3 max-h-64 overflow-y-auto">
                {mockPlaylists.map((playlist, i) => {
                  const Icon = playlistIcons[i % playlistIcons.length];
                  const isSaved = saved === playlist.id;

                  return (
                    <button
                      key={playlist.id}
                      onClick={() => handleSave(playlist.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl
                                 transition-all duration-200 text-left cursor-pointer
                                 ${
                                   isSaved
                                     ? "bg-success/10 border border-success/20"
                                     : "hover:bg-surface border border-transparent"
                                 }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                   ${isSaved ? "bg-success/20 text-success" : "bg-surface text-secondary"}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary">
                          {playlist.name}
                        </p>
                        <p className="text-xs text-secondary">
                          {playlist.animeCount} anime
                        </p>
                      </div>
                      {isSaved && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-success text-xs font-semibold"
                        >
                          Saved ✓
                        </motion.span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Create New */}
              <div className="p-4 border-t border-border">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                  className="w-full"
                >
                  Create New Playlist
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
