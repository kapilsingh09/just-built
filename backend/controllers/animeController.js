import { getPopularAnime } from "../services/animeService.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/anime/popular
// Returns trending / popular anime for the current season, served via Redis cache.
// ─────────────────────────────────────────────────────────────────────────────
export const getPopular = async (req, res) => {
  try {
    // Delegate all business logic (cache check, API fetch, transform) to the service
    const { data, source, year, season } = await getPopularAnime();

    return res.status(200).json({
      success: true,
      source,          // "cache" or "api" — useful for debugging
      meta: { year, season, count: data.length },
      data,
    });
  } catch (error) {
    console.error("[getPopular]", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
