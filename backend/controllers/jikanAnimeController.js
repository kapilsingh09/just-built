import { getPopularAnime } from "../services/jikanAnimeService.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jikan/popular
//
// Returns currently airing anime ranked by score.
// Delegates entirely to jikanAnimeService — no Redis or API logic here.
// ─────────────────────────────────────────────────────────────────────────────
export const getPopular = async (req, res) => {
  try {
    const { data, source, year, season } = await getPopularAnime();

    return res.status(200).json({
      success: true,
      source,
      meta: { year, season, count: data.length },
      data,
    });
  } catch (error) {
    console.error("[jikanAnimeController] getPopular:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
