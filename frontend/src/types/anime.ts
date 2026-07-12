// ─────────────────────────────────────────────────────────────────────────────
// Anime
//
// Single shared shape returned by every backend route:
//   GET /api/jikan/popular       (Jikan / MAL)
//   GET /api/anime/popular       (Kitsu)
//   GET /api/anime/top-rated     (Kitsu)
//   GET /api/anime/latest        (Kitsu)
//   GET /api/anime/seasonal      (Kitsu)
//
// The backend normalises both Jikan and Kitsu into this shape so the
// frontend never needs to branch on which API was called.
//
// ⚠️  NOTE: The `source` field is how the detail page knows which backend
//           route to call when a card is clicked. Always keep this populated.
// ─────────────────────────────────────────────────────────────────────────────
export interface Anime {
  id:          number | string;
  source:      "jikan" | "kitsu"; // ← which API this anime came from
  title:       string | null;
  synopsis:    string | null;
  image:       string | null;
  bannerImage: string | null;
  score:       number | null;   // out of 10 for both Jikan and Kitsu
  episodes:    number | null;
  status:      string | null;
  year:        number | null;
  season:      string | null;
  type:        string | null;   // e.g. "TV", "Movie", "OVA"
  rating:      string | null;   // content rating, e.g. "PG-13", "R17+"
  genres:      string[];        // Jikan: filled; Kitsu: filled on detail page
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimeDetail
//
// Extended shape for the detail page.
// Returned by:
//   GET /api/jikan/:id          — Jikan single anime
//   GET /api/anime/:id          — Kitsu single anime
//
// TODO: Add more fields here as needed (e.g. trailerUrl, studios, related)
// ─────────────────────────────────────────────────────────────────────────────
export interface AnimeDetail extends Anime {
  trailerUrl:  string | null;   // YouTube embed URL if available
  duration:    string | null;   // e.g. "24 min per ep"
  studios:     string[];        // production studios
  // ── ADD MORE DETAIL FIELDS HERE ────────────────────────────────────────────
  // Example: licensors: string[];
  // Example: externalLinks: { name: string; url: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Episode
//
// Returned by:
//   GET /api/jikan/:id/episodes   — Jikan episodes list
//   GET /api/anime/:id/episodes   — Kitsu episodes list
//
// Both APIs are paginated. Page 1 is fetched by default (see services).
//
// TODO: Add pagination support — the detail page hooks currently only fetch
//       page 1. Add a `page` param and infinite scroll / load-more button.
// ─────────────────────────────────────────────────────────────────────────────
export interface Episode {
  id:          number | string;
  number:      number | null;
  title:       string | null;
  synopsis:    string | null;
  thumbnail:   string | null;
  airdate:     string | null;
  duration:    number | null;   // minutes
}

// ─────────────────────────────────────────────────────────────────────────────
// API response wrapper — same envelope used by every route
// ─────────────────────────────────────────────────────────────────────────────
export interface AnimeApiResponse {
  success: boolean;
  source:  "cache" | "api";
  meta?:   { year: number; season: string; count: number }; // Jikan-only field
  data:    Anime[];
}

export interface AnimeDetailApiResponse {
  success: boolean;
  source:  "cache" | "api";
  data:    AnimeDetail;
}

export interface EpisodeApiResponse {
  success:    boolean;
  source:     "cache" | "api";
  pagination: { hasNextPage: boolean; currentPage: number };
  data:       Episode[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Playlist UI scaffolding (no backend)
// ─────────────────────────────────────────────────────────────────────────────
export interface Playlist {
  id:           string;
  name:         string;
  description?: string;
  animeCount:   number;
  coverImage?:  string;
}
