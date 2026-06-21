"use client";

import { motion } from "framer-motion";

// ─── Loader ───────────────────────────────────────────────────────────────────
// Animated loading spinner with pulsing dots.
// ──────────────────────────────────────────────────────────────────────────────

interface LoaderProps {
  message?: string;
  className?: string;
}

export default function Loader({
  message = "Loading...",
  className = "",
}: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-32 gap-6 ${className}`}
    >
      {/* Pulsing dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-accent"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="text-secondary text-sm font-medium">{message}</p>
    </div>
  );
}
