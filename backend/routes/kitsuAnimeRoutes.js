import express from "express";
import {
  getPopular,
  getTopRated,
  getLatest,
} from "../controllers/kitsuAnimeController.js";

const router = express.Router();

// ─── Kitsu Anime Routes ────────────────────────────────────────────────────────
// Mounted at: /api/anime
// Source:     Kitsu API  (https://kitsu.io/api/edge)
// ──────────────────────────────────────────────────────────────────────────────

router.get("/popular",   getPopular);   // GET /api/anime/popular
router.get("/top-rated", getTopRated);  // GET /api/anime/top-rated
router.get("/latest",    getLatest);    // GET /api/anime/latest

export default router;
