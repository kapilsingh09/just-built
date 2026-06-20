import express from "express";
import { getPopular } from "../controllers/animeController.js";

const router = express.Router();

// ─── Anime Routes ──────────────────────────────────────────────────────────────
router.get("/popular", getPopular); // GET /api/anime/popular

export default router;
