"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

// ─── IconButton ───────────────────────────────────────────────────────────────
// Circular icon-only button for notifications, playlist add, bookmarks, etc.
// ──────────────────────────────────────────────────────────────────────────────

type IconButtonVariant = "default" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  badge?: boolean;
  label?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const variantStyles: Record<IconButtonVariant, string> = {
  default:
    "bg-surface border border-border text-secondary hover:bg-white hover:text-primary hover:border-secondary/40",
  ghost:
    "bg-transparent text-secondary hover:bg-surface hover:text-primary",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

export default function IconButton({
  icon,
  variant = "default",
  size = "md",
  badge = false,
  label,
  className = "",
  onClick,
  disabled = false,
}: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      className={`
        relative inline-flex items-center justify-center
        rounded-xl transition-all duration-200
        focus-ring cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {badge && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white" />
      )}
    </motion.button>
  );
}
