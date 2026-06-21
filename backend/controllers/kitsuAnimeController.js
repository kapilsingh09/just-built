import {
  getKitsuPopular,
  getKitsuTopRated,
  getKitsuLatest,
} from "../services/kitsuAnimeService.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/anime/popular
//
// Returns the most followed / popular anime from Kitsu.
// Served via Redis cache (key: anime:popular, TTL: 3600s).
// ─────────────────────────────────────────────────────────────────────────────
export const getPopular = async (req, res) => {
  try {
    const { data, source } = await getKitsuPopular();

    return res.status(200).json({
      success: true,
      source,
      data,
    });
  } catch (error) {
    console.error("[kitsuAnimeController] getPopular:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/anime/top-rated
//
// Returns the highest rated anime from Kitsu by averageRating.
// Served via Redis cache (key: anime:top-rated, TTL: 3600s).
// ─────────────────────────────────────────────────────────────────────────────
export const getTopRated = async (req, res) => {
  try {
    const { data, source } = await getKitsuTopRated();

    return res.status(200).json({
      success: true,
      source,
      data,
    });
  } catch (error) {
    console.error("[kitsuAnimeController] getTopRated:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/anime/latest
//
// Returns the newest anime by air date from Kitsu.
// Served via Redis cache (key: anime:latest, TTL: 3600s).
// ─────────────────────────────────────────────────────────────────────────────
export const getLatest = async (req, res) => {
  try {
    const { data, source } = await getKitsuLatest();

    return res.status(200).json({
      success: true,
      source,
      data,
    });
  } catch (error) {
    console.error("[kitsuAnimeController] getLatest:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
