"use client";

import { Suspense } from "react";
import Loader from "@/components/shared/Loader";
import GenrePageContent from "./GenrePageContent";

// ─── Genre Page Layout ────────────────────────────────────────────────────────
// Next.js 13+ requires useSearchParams to be wrapped in a Suspense boundary.
// We split the page into a shell (this file) and content (GenrePageContent).
// ──────────────────────────────────────────────────────────────────────────────

export default function GenrePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader message="Loading genre..." />
        </div>
      }
    >
      <GenrePageContent />
    </Suspense>
  );
}
