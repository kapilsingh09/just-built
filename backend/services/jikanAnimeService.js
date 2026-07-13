import * as redisService from "./redisService.js";

const JIKAN_BASE_URL  = process.env.JIKAN_BASE_URL  || "https://api.jikan.moe/v4";
const ANIME_CACHE_TTL = parseInt(process.env.ANIME_CACHE_TTL, 10) || 3600; // 1 hour

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get current season label  (spring / summer / fall / winter)
// ─────────────────────────────────────────────────────────────────────────────
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // 1–12
  if (month >= 1 && month <= 3)  return "winter";
  if (month >= 4 && month <= 6)  return "spring";
  if (month >= 7 && month <= 9)  return "summer";
  return "fall";
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Transform a single raw Jikan anime entry into our API shape
// ─────────────────────────────────────────────────────────────────────────────
const transformJikanAnime = (data) => ({
  id:          data.mal_id,
  source:      "jikan",           // ← used by AnimeCard to build the detail page URL
  title:       data.title,
  synopsis:    data.synopsis,
  score:       data.score,
  episodes:    data.episodes,
  image:       data.images?.jpg?.image_url       ?? null,
  bannerImage: data.images?.jpg?.large_image_url ?? null,
  status:      data.status,
  year:        data.year,
  season:      data.season,
  type:        data.type,
  rating:      data.rating,
  genres:      data.genres?.map((g) => g.name)   ?? [],
  trailerUrl:  data.trailer?.embed_url           ?? null,
  duration:    data.duration                     ?? null,
  studios:     data.studios?.map((s) => s.name)  ?? [],
});


// ─────────────────────────────────────────────────────────────────────────────
// getPopularAnime
// GET /api/anime/popular  (Jikan — legacy endpoint)
//
// Fetches currently airing anime ranked by score.
// Cache-aside pattern:
//   1. Check Redis  (key: anime:popular:{year}:{season})
//      → HIT  → return immediately
//   2. MISS  → fetch Jikan → transform → store → return
// ─────────────────────────────────────────────────────────────────────────────
export const getPopularAnime = async () => {
  const year     = new Date().getFullYear();
  const season   = getCurrentSeason();
  const cacheKey = `anime:popular:${year}:${season}`;

  // ── Step 1: Check Redis cache ──────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);

  if (cached) {
    console.log(`[jikanAnimeService] Cache HIT  — key: ${cacheKey}`);
    return { data: cached, source: "cache", year, season };
  }

  // ── Step 2: Cache MISS — fetch from Jikan ─────────────────────────────────
  console.log(`[jikanAnimeService] Cache MISS — key: ${cacheKey} — fetching from Jikan API`);

  const url      = `${JIKAN_BASE_URL}/top/anime?filter=airing&limit=25`;
  const response = await fetch(url);

  if (!response.ok) {
    const error    = new Error(`Jikan API returned status ${response.status}`);
    error.status   = 502;
    throw error;
  }

  const json = await response.json();

  if (!Array.isArray(json.data)) {
    const error  = new Error("Unexpected response shape from Jikan API");
    error.status = 502;
    throw error;
  }

  // ── Step 3: Deduplicate by mal_id ─────────────────────────────────────────
  // Jikan can occasionally return the same title more than once across pages.
  const uniqueMap = new Map();
  for (const entry of json.data) {
    if (!uniqueMap.has(entry.mal_id)) uniqueMap.set(entry.mal_id, entry);
  }

  // ── Step 4: Transform ─────────────────────────────────────────────────────
  const transformed = Array.from(uniqueMap.values()).map(transformJikanAnime);

  // ── Step 5: Store in Redis with TTL ───────────────────────────────────────
  await redisService.set(cacheKey, transformed, ANIME_CACHE_TTL);
  console.log(`[jikanAnimeService] Stored key: ${cacheKey} (TTL: ${ANIME_CACHE_TTL}s)`);

  return { data: transformed, source: "api", year, season };
};

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      getJikanAnimeById                                      ║
// ║  GET /api/jikan/:id                                                         ║
// ║                                                                             ║
// ║  Returns FULL detail for a single Jikan/MAL anime by its mal_id.            ║
// ║  Includes: synopsis, genres, studios, trailer, duration, rating.            ║
// ║                                                                             ║
// ║  Cache key : jikan:detail:{id}   TTL: 1 hour                               ║
// ║  Rate limit: Jikan allows ~3 req/sec — Redis absorbs repeated visits.       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
export const getJikanAnimeById = async (id) => {
  const cacheKey = `jikan:detail:${id}`;

  // ── Step 1: Check Redis ────────────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);
  if (cached) {
    console.log(`[jikanAnimeService] Cache HIT  — getJikanAnimeById (key: ${cacheKey})`);
    return { data: cached, source: "cache" };
  }

  // ── Step 2: Fetch from Jikan API ──────────────────────────────────────────
  console.log(`[jikanAnimeService] Cache MISS — getJikanAnimeById (key: ${cacheKey}) — fetching Jikan API`);

  const url      = `${JIKAN_BASE_URL}/anime/${id}/full`; // /full includes all relationships
  const response = await fetch(url);

  if (!response.ok) {
    const error    = new Error(`Jikan API returned status ${response.status}`);
    error.status   = response.status === 404 ? 404 : 502;
    throw error;
  }

  const json = await response.json();

  if (!json.data) {
    const error  = new Error("Unexpected response shape from Jikan API");
    error.status = 502;
    throw error;
  }

  // ── Step 3: Transform + cache ─────────────────────────────────────────────
  const transformed = transformJikanAnime(json.data);
  await redisService.set(cacheKey, transformed, ANIME_CACHE_TTL);
  console.log(`[jikanAnimeService] Stored key: ${cacheKey} (TTL: ${ANIME_CACHE_TTL}s)`);

  return { data: transformed, source: "api" };
};

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      getJikanEpisodes                                       ║
// ║  GET /api/jikan/:id/episodes                                                ║
// ║                                                                             ║
// ║  Returns episode list for a Jikan/MAL anime.                               ║
// ║  Jikan paginates at 100 eps/page. Currently only page 1 is fetched.        ║
// ║                                                                             ║
// ║  TODO: ADD PAGINATION ─────────────────────────────────────────────────────║
// ║  To load more episodes, accept a `page` param here and in the controller.  ║
// ║  Cache key would be: jikan:episodes:{id}:page:{page}                       ║
// ║                                                                             ║
// ║  Cache key : jikan:episodes:{id}   TTL: 6 hours                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
export const getJikanEpisodes = async (id) => {
  const cacheKey = `jikan:episodes:${id}`;
  const EPISODE_TTL = 21600; // 6 hours — episodes rarely change

  // ── Step 1: Check Redis ────────────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);
  if (cached) {
    console.log(`[jikanAnimeService] Cache HIT  — getJikanEpisodes (key: ${cacheKey})`);
    return { data: cached.data, pagination: cached.pagination, source: "cache" };
  }

  // ── Step 2: Fetch page 1 from Jikan ───────────────────────────────────────
  console.log(`[jikanAnimeService] Cache MISS — getJikanEpisodes (key: ${cacheKey}) — fetching Jikan API`);

  const url      = `${JIKAN_BASE_URL}/anime/${id}/episodes?page=1`;
  const response = await fetch(url);

  if (!response.ok) {
    const error    = new Error(`Jikan API returned status ${response.status}`);
    error.status   = response.status === 404 ? 404 : 502;
    throw error;
  }

  const json = await response.json();

  // ── Step 3: Transform episodes into our shape ─────────────────────────────
  const episodes = (json.data ?? []).map((ep) => ({
    id:        ep.mal_id,
    number:    ep.mal_id,
    title:     ep.title     ?? ep.title_romanji ?? null,
    synopsis:  null,           // Jikan episodes list doesn't include synopsis
    thumbnail: null,           // Jikan episodes list doesn't include thumbnails
    airdate:   ep.aired      ?? null,
    duration:  null,           // not provided in episode list endpoint
  }));

  const pagination = {
    hasNextPage:  json.pagination?.has_next_page ?? false,
    currentPage:  json.pagination?.current_page  ?? 1,
  };

  // ── Step 4: Cache ─────────────────────────────────────────────────────────
  await redisService.set(cacheKey, { data: episodes, pagination }, EPISODE_TTL);
  console.log(`[jikanAnimeService] Stored key: ${cacheKey} (TTL: ${EPISODE_TTL}s)`);

  return { data: episodes, pagination, source: "api" };
};

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      getJikanRelations                                      ║
// ║  GET /api/jikan/:id/relations                                               ║
// ║                                                                             ║
// ║  Returns related anime (Sequel, Prequel, Side Story, etc.) for an anime.    ║
// ║  Used by the detail page to show "More from this Series" section.           ║
// ║                                                                             ║
// ║  Each item has: mal_id, title, type, relation ("Sequel", "Prequel", etc.)  ║
// ║                                                                             ║
// ║  Cache key : jikan:relations:{id}   TTL: 24 hours                          ║
// ║  (Relations almost never change so a long TTL is safe)                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
export const getJikanRelations = async (id) => {
  const cacheKey    = `jikan:relations:${id}`;
  const RELATION_TTL = 86400; // 24 hours

  // ── Step 1: Check Redis ────────────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);
  if (cached) {
    console.log(`[jikanAnimeService] Cache HIT  — getJikanRelations (key: ${cacheKey})`);
    return { data: cached, source: "cache" };
  }

  // ── Step 2: Fetch from Jikan ───────────────────────────────────────────────
  console.log(`[jikanAnimeService] Cache MISS — getJikanRelations (key: ${cacheKey}) — fetching Jikan API`);

  const url      = `${JIKAN_BASE_URL}/anime/${id}/relations`;
  const response = await fetch(url);

  if (!response.ok) {
    // Relations might not exist for all anime — return empty rather than 502
    if (response.status === 404) return { data: [], source: "api" };
    const error    = new Error(`Jikan API returned status ${response.status}`);
    error.status   = 502;
    throw error;
  }

  const json = await response.json();

  // ── Step 3: Flatten into a usable shape ───────────────────────────────────
  // Jikan returns: [ { relation: "Sequel", entry: [{ mal_id, type, name, url }] } ]
  // We flatten it to a single array with the relation type attached.
  const KEEP_RELATIONS = new Set(["Sequel", "Prequel", "Side Story", "Parent Story", "Alternative Version"]);

  const relations = [];
  for (const group of json.data ?? []) {
    if (!KEEP_RELATIONS.has(group.relation)) continue;
    for (const entry of group.entry ?? []) {
      if (entry.type !== "anime") continue; // skip manga relations
      relations.push({
        id:       entry.mal_id,
        title:    entry.name,
        relation: group.relation, // "Sequel" | "Prequel" | etc.
        url:      entry.url,
        source:   "jikan",
      });
    }
  }

  // ── Step 4: Cache ─────────────────────────────────────────────────────────
  await redisService.set(cacheKey, relations, RELATION_TTL);
  console.log(`[jikanAnimeService] Stored key: ${cacheKey} (TTL: ${RELATION_TTL}s)`);

  return { data: relations, source: "api" };
};

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      getJikanGenres                                         ║
// ║  GET /api/jikan/genres                                                      ║
// ║                                                                             ║
// ║  Returns the full list of anime genres from the Jikan API.                  ║
// ║  Each genre has: { id, name, count }                                        ║
// ║                                                                             ║
// ║  Cache key : jikan:genres   TTL: 24 hours (genres rarely change)            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
export const getJikanGenres = async () => {
  const cacheKey  = "jikan:genres";
  const GENRE_TTL = 86400; // 24 hours

  // ── Step 1: Check Redis ────────────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);
  if (cached) {
    console.log(`[jikanAnimeService] Cache HIT  — getJikanGenres (key: ${cacheKey})`);
    return { data: cached, source: "cache" };
  }

  // ── Step 2: Fetch from Jikan API ──────────────────────────────────────────
  console.log(`[jikanAnimeService] Cache MISS — getJikanGenres — fetching Jikan API`);

  const url      = `${JIKAN_BASE_URL}/genres/anime`;
  const response = await fetch(url);

  if (!response.ok) {
    const error    = new Error(`Jikan API returned status ${response.status}`);
    error.status   = 502;
    throw error;
  }

  const json = await response.json();

  if (!Array.isArray(json.data)) {
    const error  = new Error("Unexpected response shape from Jikan genres API");
    error.status = 502;
    throw error;
  }

  // ── Step 3: Transform to a clean shape ────────────────────────────────────
  // Filter out explicit genres and sort by count desc for best UX
  const EXCLUDE_IDS = new Set([12, 49, 58]); // Hentai, Erotica, explicit
  const genres = json.data
    .filter((g) => !EXCLUDE_IDS.has(g.mal_id))
    .map((g) => ({
      id:    g.mal_id,
      name:  g.name,
      count: g.count,
    }))
    .sort((a, b) => b.count - a.count);

  // ── Step 4: Cache ─────────────────────────────────────────────────────────
  await redisService.set(cacheKey, genres, GENRE_TTL);
  console.log(`[jikanAnimeService] Stored key: ${cacheKey} (TTL: ${GENRE_TTL}s)`);

  return { data: genres, source: "api" };
};

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      getJikanAnimeByGenre                                   ║
// ║  GET /api/jikan/genre/:genreId                                              ║
// ║                                                                             ║
// ║  Returns anime filtered by genre ID with optional sort/status/type params.  ║
// ║  Supports pagination via `page` param.                                      ║
// ║                                                                             ║
// ║  Query params:                                                              ║
// ║    page    — page number (default: 1)                                       ║
// ║    sort    — score | popularity | latest | title (default: score)           ║
// ║    status  — airing | complete | upcoming (optional, default: all)          ║
// ║    type    — tv | movie | ova | special | ona (optional, default: all)      ║
// ║                                                                             ║
// ║  Cache key : jikan:genre:{id}:{page}:{sort}:{status}:{type}                ║
// ║  TTL: 1 hour                                                                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
export const getJikanAnimeByGenre = async (genreId, { page = 1, sort = "score", status = "", type = "" } = {}) => {
  const cacheKey = `jikan:genre:${genreId}:${page}:${sort}:${status}:${type}`;

  // ── Step 1: Check Redis ────────────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);
  if (cached) {
    console.log(`[jikanAnimeService] Cache HIT  — getJikanAnimeByGenre (key: ${cacheKey})`);
    return { data: cached.data, pagination: cached.pagination, source: "cache" };
  }

  // ── Step 2: Build Jikan URL ────────────────────────────────────────────────
  // Map our sort param to Jikan's order_by / sort params
  const ORDER_MAP = {
    score:      { order_by: "score",         sort: "desc" },
    popularity: { order_by: "popularity",    sort: "asc"  },
    latest:     { order_by: "start_date",    sort: "desc" },
    title:      { order_by: "title",         sort: "asc"  },
  };
  const { order_by, sort: sortDir } = ORDER_MAP[sort] ?? ORDER_MAP.score;

  const params = new URLSearchParams({
    genres:   genreId,
    order_by,
    sort:     sortDir,
    limit:    "24",
    page:     String(page),
    sfw:      "true",   // Safe-for-work filter
  });
  if (status) params.set("status", status);
  if (type)   params.set("type",   type);

  console.log(`[jikanAnimeService] Cache MISS — getJikanAnimeByGenre (key: ${cacheKey}) — fetching Jikan API`);

  const url      = `${JIKAN_BASE_URL}/anime?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error    = new Error(`Jikan API returned status ${response.status}`);
    error.status   = response.status === 404 ? 404 : 502;
    throw error;
  }

  const json = await response.json();

  if (!Array.isArray(json.data)) {
    const error  = new Error("Unexpected response shape from Jikan anime-by-genre API");
    error.status = 502;
    throw error;
  }

  // ── Step 3: Deduplicate + Transform ───────────────────────────────────────
  const uniqueMap = new Map();
  for (const entry of json.data) {
    if (!uniqueMap.has(entry.mal_id)) uniqueMap.set(entry.mal_id, entry);
  }
  const transformed = Array.from(uniqueMap.values()).map(transformJikanAnime);

  const pagination = {
    hasNextPage:  json.pagination?.has_next_page ?? false,
    currentPage:  json.pagination?.current_page  ?? 1,
    lastPage:     json.pagination?.last_visible_page ?? 1,
    total:        json.pagination?.items?.total ?? 0,
  };

  // ── Step 4: Cache ─────────────────────────────────────────────────────────
  await redisService.set(cacheKey, { data: transformed, pagination }, ANIME_CACHE_TTL);
  console.log(`[jikanAnimeService] Stored key: ${cacheKey} (TTL: ${ANIME_CACHE_TTL}s)`);

  return { data: transformed, pagination, source: "api" };
};
