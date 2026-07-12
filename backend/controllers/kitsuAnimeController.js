import {
  getKitsuPopular,
  getKitsuTopRated,
  getKitsuLatest,
  getKitsuSeasonalPopular,
  getKitsuAnimeById,
  getKitsuEpisodes,
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/anime/seasonal
//
// Returns the most fan-popular anime currently airing this season.
// Served via Redis cache (key: anime:seasonal:<year>:<season>, TTL: 21600s).
// ─────────────────────────────────────────────────────────────────────────────
export const getSeasonalPopular = async (req, res) => {
  try {
    const { data, source, season, year } = await getKitsuSeasonalPopular();

    return res.status(200).json({
      success: true,
      source,
      season,
      year,
      data,
    });
  } catch (error) {
    console.error("[kitsuAnimeController] getSeasonalPopular:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/anime/:id
//
// Returns full detail for a single Kitsu anime by Kitsu ID.
// Includes genre names resolved from the categories relationship.
// ─────────────────────────────────────────────────────────────────────────────
export const getAnimeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, source } = await getKitsuAnimeById(id);

    return res.status(200).json({
      success: true,
      source,
      data,
    });
  } catch (error) {
    console.error("[kitsuAnimeController] getAnimeById:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/anime/:id/episodes
//
// Returns episode list (page 1) for a Kitsu anime.
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  TODO: ADD ?page=N QUERY PARAM                                          ║
// ║  When the frontend needs more episodes, read req.query.page here        ║
// ║  and pass it to getKitsuEpisodes(id, page).                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// ─────────────────────────────────────────────────────────────────────────────
export const getAnimeEpisodes = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, pagination, source } = await getKitsuEpisodes(id);

    return res.status(200).json({
      success: true,
      source,
      pagination,
      data,
    });
  } catch (error) {
    console.error("[kitsuAnimeController] getAnimeEpisodes:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
