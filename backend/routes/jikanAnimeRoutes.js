import express from "express";
import {
  getPopular,
  getAnimeById,
  getAnimeEpisodes,
} from "../controllers/jikanAnimeController.js";

const router = express.Router();

// ─── Jikan Anime Routes ────────────────────────────────────────────────────────
// Mounted at: /api/jikan
// Source:     MyAnimeList data via Jikan REST API
// ──────────────────────────────────────────────────────────────────────────────

router.get("/popular",           getPopular);       // GET /api/jikan/popular
router.get("/:id",               getAnimeById);     // GET /api/jikan/:id
router.get("/:id/episodes",      getAnimeEpisodes); // GET /api/jikan/:id/episodes

export default router;
