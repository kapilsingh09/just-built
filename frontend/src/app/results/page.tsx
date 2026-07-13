"use client";

import { Suspense } from "react";
import Loader from "@/components/shared/Loader";
import ResultsContent from "./ResultsContent";

// ─── Results Page ─────────────────────────────────────────────────────────────
// /results?genre=<id>&name=<name>     ← genre browsing
// /results?q=<query>                  ← search (future)
//
// Suspense boundary required by Next.js 13+ for useSearchParams.
// ──────────────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader message="Loading results..." />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
