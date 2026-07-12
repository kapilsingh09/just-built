import express from "express";
import {
  getPopular,
  getTopRated,
  getLatest,
  getSeasonalPopular,
  getAnimeById,
  getAnimeEpisodes,
} from "../controllers/kitsuAnimeController.js";

const router = express.Router();

// ─── Kitsu Anime Routes ────────────────────────────────────────────────────────
// Mounted at: /api/anime
// Source:     Kitsu API  (https://kitsu.io/api/edge)
// ──────────────────────────────────────────────────────────────────────────────

router.get("/popular",           getPopular);          // GET /api/anime/popular
router.get("/top-rated",         getTopRated);         // GET /api/anime/top-rated
router.get("/latest",            getLatest);           // GET /api/anime/latest
router.get("/seasonal",          getSeasonalPopular);  // GET /api/anime/seasonal

// ⚠️  IMPORTANT: /:id routes must come AFTER named routes like /popular /seasonal
//    so Express does not treat those names as IDs.
router.get("/:id",               getAnimeById);        // GET /api/anime/:id
router.get("/:id/episodes",      getAnimeEpisodes);    // GET /api/anime/:id/episodes

export default router;
