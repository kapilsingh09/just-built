// ─── AnimeBadge ───────────────────────────────────────────────────────────────
// Reusable pill badge for genres, status, type, and ratings.
// ──────────────────────────────────────────────────────────────────────────────

type BadgeVariant = "genre" | "status" | "rating" | "type";

interface AnimeBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantClass: Record<BadgeVariant, string> = {
  genre: "badge-genre",
  status: "badge-status",
  rating: "badge-rating",
  type: "badge-type",
};

export default function AnimeBadge({
  label,
  variant = "genre",
  className = "",
}: AnimeBadgeProps) {
  // Auto-detect status sub-variant
  let badgeClass = variantClass[variant];
  if (variant === "status") {
    const lower = label.toLowerCase();
    if (lower.includes("airing")) badgeClass = "badge-status-airing";
    else if (lower.includes("finished") || lower.includes("completed"))
      badgeClass = "badge-status-completed";
    else if (lower.includes("upcoming")) badgeClass = "badge-status-upcoming";
  }

  return (
    <span className={`badge-base ${badgeClass} ${className}`}>{label}</span>
  );
}
