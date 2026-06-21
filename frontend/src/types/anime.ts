// ─────────────────────────────────────────────────────────────────────────────
// Anime
//
// Single shared shape returned by every backend route:
//   GET /api/jikan/popular       (Jikan / MAL)
//   GET /api/anime/popular       (Kitsu)
//   GET /api/anime/top-rated     (Kitsu)
//   GET /api/anime/latest        (Kitsu)
//
// The backend normalises both Jikan and Kitsu into this shape so the
// frontend never needs to branch on which API was called.
// ─────────────────────────────────────────────────────────────────────────────
export interface Anime {
  id:          number | string;
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
  genres:      string[];        // Jikan: filled; Kitsu: [] (needs separate call)
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
