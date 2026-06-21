// ─────────────────────────────────────────────────────────────────────────────
// animeService.js — Barrel re-export
//
// Re-exports every public function from the two dedicated service files so
// existing imports of "@/services/animeService.js" continue to work without
// any changes to callers.
//
//   jikanAnimeService  → Jikan API  (MyAnimeList data)
//   kitsuAnimeService  → Kitsu API  (popular / top-rated / latest)
// ─────────────────────────────────────────────────────────────────────────────

export { getPopularAnime } from "./jikanAnimeService.js";

export {
  getKitsuPopular,
  getKitsuTopRated,
  getKitsuLatest,
} from "./kitsuAnimeService.js";
