"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

// ─── Section ──────────────────────────────────────────────────────────────────
// Animated section wrapper with consistent padding and whileInView fade-up.
// ──────────────────────────────────────────────────────────────────────────────

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

export default function Section({
  children,
  className = "",
  id,
  delay = 0,
}: SectionProps) {
  return (
    <motion.section
      id={id}
      className={`section-padding ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
