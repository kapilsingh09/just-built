import {
  getPopularAnime,
  getJikanAnimeById,
  getJikanEpisodes,
  getJikanRelations,
  getJikanGenres,
  getJikanAnimeByGenre,
} from "../services/jikanAnimeService.js";

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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jikan/:id
//
// Returns full anime detail for a single MAL anime by its mal_id.
// Delegates to getJikanAnimeById in jikanAnimeService.
// ─────────────────────────────────────────────────────────────────────────────
export const getAnimeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, source } = await getJikanAnimeById(id);

    return res.status(200).json({
      success: true,
      source,
      data,
    });
  } catch (error) {
    console.error("[jikanAnimeController] getAnimeById:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jikan/:id/episodes
//
// Returns the episode list (page 1) for a MAL anime.
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  TODO: ADD ?page=N QUERY PARAM                                          ║
// ║  When the frontend needs more episodes, read req.query.page here        ║
// ║  and pass it to getJikanEpisodes(id, page).                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// ─────────────────────────────────────────────────────────────────────────────
export const getAnimeEpisodes = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, pagination, source } = await getJikanEpisodes(id);

    return res.status(200).json({
      success: true,
      source,
      pagination,
      data,
    });
  } catch (error) {
    console.error("[jikanAnimeController] getAnimeEpisodes:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jikan/:id/relations
//
// Returns related anime (Sequel, Prequel, Side Story, etc.).
// Used by the detail page to show "More from this Series".
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jikan/genres
//
// Returns the full list of anime genres from Jikan.
// ─────────────────────────────────────────────────────────────────────────────
export const getGenres = async (req, res) => {
  try {
    const { data, source } = await getJikanGenres();
    return res.status(200).json({ success: true, source, data });
  } catch (error) {
    console.error("[jikanAnimeController] getGenres:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jikan/genre/:genreId
//
// Returns anime filtered by genre ID.
// Query params: page, sort, status, type
// ─────────────────────────────────────────────────────────────────────────────
export const getAnimeByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = "1", sort = "score", status = "", type = "" } = req.query;
    const { data, pagination, source } = await getJikanAnimeByGenre(genreId, {
      page:   parseInt(page, 10) || 1,
      sort,
      status,
      type,
    });
    return res.status(200).json({ success: true, source, pagination, data });
  } catch (error) {
    console.error("[jikanAnimeController] getAnimeByGenre:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAnimeRelations = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, source } = await getJikanRelations(id);

    return res.status(200).json({
      success: true,
      source,
      data,
    });
  } catch (error) {
    console.error("[jikanAnimeController] getAnimeRelations:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
