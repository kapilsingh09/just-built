'use client';

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { type ReactNode } from "react";

// ─── QueryProvider ─────────────────────────────────────────────────────────────
// Must be a Client Component because QueryClientProvider uses React context.
// Wraps the entire app so any component can call useQuery / useMutation.
// ──────────────────────────────────────────────────────────────────────────────
export default function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
