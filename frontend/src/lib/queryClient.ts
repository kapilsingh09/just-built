import { QueryClient } from "@tanstack/react-query";

// ─── Singleton QueryClient ─────────────────────────────────────────────────────
// staleTime:  5 minutes  — data is considered fresh, no refetch on window focus
// gcTime:     10 minutes — inactive queries stay in memory for this long
// retry:      1          — retry failed requests once before showing an error
// ──────────────────────────────────────────────────────────────────────────────
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          5 * 60 * 1000,  // 5 min
      gcTime:             10 * 60 * 1000, // 10 min (formerly cacheTime)
      retry:              1,
      refetchOnWindowFocus: false,        // don't refetch just because user switched tabs
    },
  },
});
