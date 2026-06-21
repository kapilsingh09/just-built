// ─── Anime Types ──────────────────────────────────────────────────────────────

export interface Anime {
  id: number;
  title: string;
  synopsis: string;
  score: number;
  episodes: number;
  image: string;
  bannerImage: string;
  status: string;
  year: number;
  season: string;
  type: string;
  rating: string;
  genres: string[];
}

export interface AnimeApiResponse {
  success: boolean;
  source: "cache" | "api";
  meta: {
    year: number;
    season: string;
    count: number;
  };
  data: Anime[];
}

// ─── Playlist Types (UI scaffolding — no backend) ─────────────────────────────

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  animeCount: number;
  coverImage?: string;
}
