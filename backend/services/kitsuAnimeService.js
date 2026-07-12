import * as redisService from "./redisService.js";

const KITSU_BASE_URL  = process.env.KITSU_BASE_URL  || "https://kitsu.io/api/edge";
const ANIME_CACHE_TTL = parseInt(process.env.ANIME_CACHE_TTL, 10) || 3600; // 1 hour

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Transform a single raw Kitsu anime entry into the shared Anime shape.
//
// Output is intentionally identical to the Jikan transform so the frontend
// can use one single interface for all routes — no frontend normalisation needed.
//
// Field mapping:
//   score       ← averageRating (string "78.23") ÷ 10  → number  7.8
//   year        ← startDate ("2024-10-05")        → 2024
//   type        ← subtype ("TV", "movie", "OVA")
//   rating      ← ageRatingGuide (human-readable)  or ageRating fallback
//   genres      ← [] (Kitsu genre names need a separate API request)
// ─────────────────────────────────────────────────────────────────────────────
const transformKitsuAnime = (anime) => {
  const attrs = anime.attributes;

  // Kitsu posterImage sizes (portrait): tiny < small < medium < large < original
  // Kitsu coverImage  sizes (landscape): tiny < small < large < original
  // We always prefer the biggest available for best display quality.
  const posterImage =
    attrs.posterImage?.original ??
    attrs.posterImage?.large    ??
    attrs.posterImage?.medium   ??
    null;

  const coverImage =
    attrs.coverImage?.original ??
    attrs.coverImage?.large    ??
    attrs.coverImage?.small    ??
    null;

  // ── Extract genres from included relationships (if present) ────────────────
  // When `?include=categories` is passed to Kitsu, genres live in anime.relationships
  // NOTE: For list endpoints, genres are NOT included (empty array is fine).
  //       The detail endpoint fetches with ?include=categories to fill this.
  const genres = [];
  if (Array.isArray(anime.relationships?.categories?.data)) {
    // IDs only — the actual names come from the `included` array in the response
    // This is handled in getKitsuAnimeById, not here
  }

  return {
    id:          anime.id,
    source:      "kitsu",         // ← used by AnimeCard to build the detail page URL
    title:       attrs.canonicalTitle                           ?? null,
    synopsis:    attrs.synopsis                                 ?? null,
    image:       posterImage,                  // high-res portrait poster
    bannerImage: coverImage ?? posterImage,    // landscape cover; fall back to poster
    score:       attrs.averageRating
                   ? Math.round(parseFloat(attrs.averageRating) / 10 * 10) / 10
                   : null,
    episodes:    attrs.episodeCount                             ?? null,
    status:      attrs.status                                   ?? null,
    year:        attrs.startDate
                   ? new Date(attrs.startDate).getFullYear()
                   : null,
    season:      attrs.season                                   ?? null,
    type:        attrs.subtype       ?? null,  // "TV" | "movie" | "OVA" | etc.
    rating:      attrs.ageRatingGuide ?? attrs.ageRating ?? null,
    genres:      genres,           // filled by getKitsuAnimeById on detail page
    trailerUrl:  attrs.youtubeVideoId
                   ? `https://www.youtube.com/embed/${attrs.youtubeVideoId}`
                   : null,
    duration:    attrs.episodeLength ? `${attrs.episodeLength} min per ep` : null,
    studios:     [],               // TODO: Kitsu studios need a separate relationship fetch
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Shared cache-aside fetcher for all Kitsu endpoints
//
// cacheKey  — Redis key  (e.g. "anime:popular")
// kitsuUrl  — full Kitsu endpoint URL to hit on cache miss
// label     — identifier used in log messages
//
// Flow:
//   1. Check Redis      → HIT  → return immediately
//   2. Cache MISS       → fetch Kitsu API
//   3. Validate shape   → guard against unexpected payloads
//   4. Transform        → map raw Kitsu entries to our schema
//   5. Store in Redis   → set with TTL
//   6. Return data
// ─────────────────────────────────────────────────────────────────────────────
const fetchKitsuWithCache = async (cacheKey, kitsuUrl, label) => {
  // ── Step 1: Check Redis cache ──────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);

  if (cached) {
    console.log(`[kitsuAnimeService] Cache HIT  — ${label} (key: ${cacheKey})`);
    return { data: cached, source: "cache" };
  }

  // ── Step 2: Cache MISS — fetch from Kitsu API ──────────────────────────────
  console.log(`[kitsuAnimeService] Cache MISS — ${label} (key: ${cacheKey}) — fetching Kitsu API`);

  const response = await fetch(kitsuUrl, {
    headers: {
      Accept: "application/vnd.api+json", // Required by Kitsu JSON:API spec
    },
  });

  if (!response.ok) {
    const error    = new Error(`Kitsu API returned status ${response.status}`);
    error.status   = 502;
    throw error;
  }

  const json = await response.json();

  // ── Step 3: Guard — ensure data array exists ───────────────────────────────
  if (!Array.isArray(json.data)) {
    const error  = new Error("Unexpected response shape from Kitsu API");
    error.status = 502;
    throw error;
  }

  // ── Step 4: Transform raw Kitsu entries to our schema ─────────────────────
  const transformed = json.data.map(transformKitsuAnime);

  // ── Step 5: Store in Redis with TTL ───────────────────────────────────────
  await redisService.set(cacheKey, transformed, ANIME_CACHE_TTL);
  console.log(`[kitsuAnimeService] Stored key: ${cacheKey} (TTL: ${ANIME_CACHE_TTL}s)`);

  // ── Step 6: Return ────────────────────────────────────────────────────────
  return { data: transformed, source: "api" };
};

// ─────────────────────────────────────────────────────────────────────────────
// getKitsuPopular
// GET /api/anime/popular
//
// Sorted by -userCount → most followed / popular titles on Kitsu.
// Cache key: anime:popular
// ─────────────────────────────────────────────────────────────────────────────
export const getKitsuPopular = async () => {
  const cacheKey = "anime:popular";
  const kitsuUrl = `${KITSU_BASE_URL}/anime?page[limit]=20&sort=-userCount`;

  return fetchKitsuWithCache(cacheKey, kitsuUrl, "getKitsuPopular");
};

// ─────────────────────────────────────────────────────────────────────────────
// getKitsuTopRated
// GET /api/anime/top-rated
//
// Sorted by -averageRating → highest community score on Kitsu.
// Cache key: anime:top-rated
// ─────────────────────────────────────────────────────────────────────────────
export const getKitsuTopRated = async () => {
  const cacheKey = "anime:top-rated";
  const kitsuUrl = `${KITSU_BASE_URL}/anime?page[limit]=20&sort=-averageRating`;

  return fetchKitsuWithCache(cacheKey, kitsuUrl, "getKitsuTopRated");
};

// ─────────────────────────────────────────────────────────────────────────────
// getKitsuLatest
// GET /api/anime/latest
//
// Sorted by -startDate → newest anime by air date on Kitsu.
// Cache key: anime:latest
// ─────────────────────────────────────────────────────────────────────────────
export const getKitsuLatest = async () => {
  const cacheKey = "anime:latest";
  const kitsuUrl = `${KITSU_BASE_URL}/anime?page[limit]=20&sort=-startDate`;

  return fetchKitsuWithCache(cacheKey, kitsuUrl, "getKitsuLatest");
};

// ─────────────────────────────────────────────────────────────────────────────
// getKitsuSeasonalPopular
// GET /api/anime/seasonal
//
// Returns popular anime airing in the current season (quarter) of the current
// year, sorted by -userCount so the most fan-followed shows come first.
//
// Season mapping (by month):
//   Jan–Mar  → Winter
//   Apr–Jun  → Spring
//   Jul–Sep  → Summer
//   Oct–Dec  → Fall
//
// Strategy:
//   Kitsu doesn't expose a season filter natively, so we:
//   1. Filter by status = "current" (currently airing)
//   2. Filter startDate to be within the current year
//   3. Sort by -userCount for fan popularity
//   4. Fetch 30 results and post-filter to the current season window client-side
//      (inside the service) so we always return 10–20 clean results.
//
// Cache key: anime:seasonal:<year>:<season>  (e.g. anime:seasonal:2025:summer)
// Cache TTL: 6 hours (21600s) — seasonal data changes slowly
// ─────────────────────────────────────────────────────────────────────────────
export const getKitsuSeasonalPopular = async () => {
  const now        = new Date();
  const year       = now.getFullYear();
  const month      = now.getMonth() + 1; // 1-indexed

  // Determine current season label and date window
  let season, seasonStart, seasonEnd;
  if (month <= 3) {
    season      = "winter";
    seasonStart = `${year}-01-01`;
    seasonEnd   = `${year}-03-31`;
  } else if (month <= 6) {
    season      = "spring";
    seasonStart = `${year}-04-01`;
    seasonEnd   = `${year}-06-30`;
  } else if (month <= 9) {
    season      = "summer";
    seasonStart = `${year}-07-01`;
    seasonEnd   = `${year}-09-30`;
  } else {
    season      = "fall";
    seasonStart = `${year}-10-01`;
    seasonEnd   = `${year}-12-31`;
  }

  const cacheKey = `anime:seasonal:${year}:${season}`;
  const SEASONAL_TTL = 21600; // 6 hours

  // ── Step 1: Check Redis cache ──────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);
  if (cached) {
    console.log(`[kitsuAnimeService] Cache HIT  — getKitsuSeasonalPopular (key: ${cacheKey})`);
    return { data: cached, source: "cache", season, year };
  }

  // ── Step 2: Fetch from Kitsu — currently airing, sorted by popularity ─────
  console.log(`[kitsuAnimeService] Cache MISS — getKitsuSeasonalPopular (key: ${cacheKey}) — fetching Kitsu API`);

  // Filter: status=current (airing now), startDate in this year, sort by fans
  // Note: Kitsu API max limit is 20. Do not increase page[limit] above 20 or it throws a 400 Error.
  const kitsuUrl = `${KITSU_BASE_URL}/anime?filter[status]=current&filter[seasonYear]=${year}&page[limit]=20&sort=-userCount`;

  const response = await fetch(kitsuUrl, {
    headers: { Accept: "application/vnd.api+json" },
  });

  if (!response.ok) {
    const error  = new Error(`Kitsu API returned status ${response.status}`);
    error.status = 502;
    throw error;
  }

  const json = await response.json();

  if (!Array.isArray(json.data)) {
    const error  = new Error("Unexpected response shape from Kitsu API");
    error.status = 502;
    throw error;
  }

  // ── Step 3: Post-filter to current season window & transform ──────────────
  const startMs = new Date(seasonStart).getTime();
  const endMs   = new Date(seasonEnd).getTime();

  const transformed = json.data
    .filter((anime) => {
      const startDate = anime.attributes?.startDate;
      if (!startDate) return true; // keep if no date (currently airing)
      const ms = new Date(startDate).getTime();
      return ms >= startMs && ms <= endMs;
    })
    .map(transformKitsuAnime);

  // If season filter is too strict and returns nothing, fall back to all current
  const finalData = transformed.length > 0
    ? transformed
    : json.data.map(transformKitsuAnime);

  // ── Step 4: Store in Redis ─────────────────────────────────────────────────
  await redisService.set(cacheKey, finalData, SEASONAL_TTL);
  console.log(`[kitsuAnimeService] Stored key: ${cacheKey} (TTL: ${SEASONAL_TTL}s)`);

  return { data: finalData, source: "api", season, year };
};

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      getKitsuAnimeById                                      ║
// ║  GET /api/anime/:id                                                         ║
// ║                                                                             ║
// ║  Returns FULL detail for a single Kitsu anime by its Kitsu ID.              ║
// ║  Includes genres via ?include=categories (resolved from `included` array).  ║
// ║                                                                             ║
// ║  Cache key : kitsu:detail:{id}   TTL: 6 hours                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
export const getKitsuAnimeById = async (id) => {
  const cacheKey  = `kitsu:detail:${id}`;
  const DETAIL_TTL = 21600; // 6 hours

  // ── Step 1: Check Redis ────────────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);
  if (cached) {
    console.log(`[kitsuAnimeService] Cache HIT  — getKitsuAnimeById (key: ${cacheKey})`);
    return { data: cached, source: "cache" };
  }

  // ── Step 2: Fetch from Kitsu with genres included ─────────────────────────
  console.log(`[kitsuAnimeService] Cache MISS — getKitsuAnimeById (key: ${cacheKey}) — fetching Kitsu API`);

  const url = `${KITSU_BASE_URL}/anime/${id}?include=categories`;
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.api+json" },
  });

  if (!response.ok) {
    const error    = new Error(`Kitsu API returned status ${response.status}`);
    error.status   = response.status === 404 ? 404 : 502;
    throw error;
  }

  const json = await response.json();

  if (!json.data) {
    const error  = new Error("Unexpected response shape from Kitsu API");
    error.status = 502;
    throw error;
  }

  // ── Step 3: Extract genre names from the `included` sideloaded data ───────
  // Kitsu uses JSON:API — genres come in `json.included` as separate objects.
  // We match them to the anime via the categories relationship.
  const genreIds = new Set(
    (json.data.relationships?.categories?.data ?? []).map((c) => c.id)
  );
  const genres = (json.included ?? [])
    .filter((inc) => inc.type === "categories" && genreIds.has(inc.id))
    .map((inc) => inc.attributes?.title ?? null)
    .filter(Boolean);

  // ── Step 4: Transform with genres ─────────────────────────────────────────
  const transformed = transformKitsuAnime(json.data);
  transformed.genres = genres; // override the empty array with real genres

  // ── Step 5: Cache ─────────────────────────────────────────────────────────
  await redisService.set(cacheKey, transformed, DETAIL_TTL);
  console.log(`[kitsuAnimeService] Stored key: ${cacheKey} (TTL: ${DETAIL_TTL}s)`);

  return { data: transformed, source: "api" };
};

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      getKitsuEpisodes                                       ║
// ║  GET /api/anime/:id/episodes                                                ║
// ║                                                                             ║
// ║  Returns episode list for a Kitsu anime.                                   ║
// ║  Kitsu paginates at 20 eps/page. Currently only page 1 is fetched.         ║
// ║                                                                             ║
// ║  TODO: ADD PAGINATION ─────────────────────────────────────────────────────║
// ║  To load more episodes, accept a `page` param in the controller and        ║
// ║  pass it here. The Kitsu offset pagination looks like:                     ║
// ║    ?page[limit]=20&page[offset]=(page-1)*20                                ║
// ║  Cache key per page: kitsu:episodes:{id}:page:{page}                      ║
// ║                                                                             ║
// ║  Cache key : kitsu:episodes:{id}   TTL: 6 hours                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
export const getKitsuEpisodes = async (id) => {
  const cacheKey   = `kitsu:episodes:${id}`;
  const EPISODE_TTL = 21600; // 6 hours

  // ── Step 1: Check Redis ────────────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);
  if (cached) {
    console.log(`[kitsuAnimeService] Cache HIT  — getKitsuEpisodes (key: ${cacheKey})`);
    return { data: cached.data, pagination: cached.pagination, source: "cache" };
  }

  // ── Step 2: Fetch page 1 from Kitsu ───────────────────────────────────────
  console.log(`[kitsuAnimeService] Cache MISS — getKitsuEpisodes (key: ${cacheKey}) — fetching Kitsu API`);

  const url = `${KITSU_BASE_URL}/anime/${id}/episodes?page[limit]=20&page[offset]=0&sort=number`;
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.api+json" },
  });

  if (!response.ok) {
    const error    = new Error(`Kitsu API returned status ${response.status}`);
    error.status   = response.status === 404 ? 404 : 502;
    throw error;
  }

  const json = await response.json();

  // ── Step 3: Transform episodes ────────────────────────────────────────────
  const episodes = (json.data ?? []).map((ep) => ({
    id:        ep.id,
    number:    ep.attributes?.number     ?? null,
    title:     ep.attributes?.canonicalTitle ?? ep.attributes?.titles?.en ?? null,
    synopsis:  ep.attributes?.synopsis   ?? null,
    thumbnail: ep.attributes?.thumbnail?.original ?? null,
    airdate:   ep.attributes?.airdate    ?? null,
    duration:  ep.attributes?.length     ?? null, // minutes
  }));

  const pagination = {
    // Kitsu uses meta.count — check if there are more results
    hasNextPage:  (json.meta?.count ?? 0) > 20,
    currentPage:  1,
  };

  // ── Step 4: Cache ─────────────────────────────────────────────────────────
  await redisService.set(cacheKey, { data: episodes, pagination }, EPISODE_TTL);
  console.log(`[kitsuAnimeService] Stored key: ${cacheKey} (TTL: ${EPISODE_TTL}s)`);

  return { data: episodes, pagination, source: "api" };
};
