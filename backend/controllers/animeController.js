// ─────────────────────────────────────────────────────────────────────────────
// animeController.js — Barrel re-export
//
// Kept for backward compatibility.
// Import directly from the dedicated controllers for new code:
//   jikanAnimeController.js  →  Jikan / MAL handlers
//   kitsuAnimeController.js  →  Kitsu handlers
// ─────────────────────────────────────────────────────────────────────────────

export { getPopular }                                    from "./jikanAnimeController.js";
export { getPopular  as getKitsuPopular,
         getTopRated as getKitsuTopRated,
         getLatest   as getKitsuLatest   }               from "./kitsuAnimeController.js";
