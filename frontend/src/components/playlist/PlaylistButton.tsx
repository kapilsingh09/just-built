"use client";

import { Plus } from "lucide-react";
import IconButton from "../buttons/IconButton";

// ─── PlaylistButton ───────────────────────────────────────────────────────────
// Reusable button that triggers the playlist modal.
// ──────────────────────────────────────────────────────────────────────────────

interface PlaylistButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function PlaylistButton({
  onClick,
  className = "",
}: PlaylistButtonProps) {
  return (
    <IconButton
      icon={<Plus className="w-4 h-4" />}
      variant="default"
      size="sm"
      label="Add to playlist"
      onClick={onClick}
      className={className}
    />
  );
}
