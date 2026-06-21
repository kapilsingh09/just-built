import express from "express";
import { getPopular } from "../controllers/jikanAnimeController.js";

const router = express.Router();

// ─── Jikan Anime Routes ────────────────────────────────────────────────────────
// Mounted at: /api/jikan
// Source:     MyAnimeList data via Jikan REST API
// ──────────────────────────────────────────────────────────────────────────────

router.get("/popular", getPopular); // GET /api/jikan/popular

export default router;
