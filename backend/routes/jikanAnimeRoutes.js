import express from "express";
import {
  getPopular,
  getAnimeById,
  getAnimeEpisodes,
  getAnimeRelations,
  getGenres,
  getAnimeByGenre,
} from "../controllers/jikanAnimeController.js";

const router = express.Router();

// ─── Jikan Anime Routes ────────────────────────────────────────────────────────
// Mounted at: /api/jikan
// Source:     MyAnimeList data via Jikan REST API
// ──────────────────────────────────────────────────────────────────────────────

// ⚠️  IMPORTANT: Named routes MUST come before /:id wildcard routes
router.get("/popular",           getPopular);        // GET /api/jikan/popular
router.get("/genres",            getGenres);         // GET /api/jikan/genres
router.get("/genre/:genreId",    getAnimeByGenre);   // GET /api/jikan/genre/:genreId?page=1&sort=score&status=&type=

router.get("/:id",               getAnimeById);      // GET /api/jikan/:id
router.get("/:id/episodes",      getAnimeEpisodes);  // GET /api/jikan/:id/episodes
router.get("/:id/relations",     getAnimeRelations); // GET /api/jikan/:id/relations

export default router;
