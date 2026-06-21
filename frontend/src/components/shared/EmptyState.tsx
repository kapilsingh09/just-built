"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { FileQuestion } from "lucide-react";

// ─── EmptyState ───────────────────────────────────────────────────────────────
// Placeholder for empty / error states with icon, message, and optional CTA.
// ──────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title = "Nothing here yet",
  message = "Check back later for updates.",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-24 gap-4 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center border border-border">
        {icon ?? <FileQuestion className="w-7 h-7 text-secondary" />}
      </div>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <p className="text-secondary text-sm max-w-md">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}
