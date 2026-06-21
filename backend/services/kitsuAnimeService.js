import * as redisService from "./redisService.js";

const KITSU_BASE_URL  = process.env.KITSU_BASE_URL  || "https://kitsu.io/api/edge";
const ANIME_CACHE_TTL = parseInt(process.env.ANIME_CACHE_TTL, 10) || 3600; // 1 hour

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Transform a single raw Kitsu anime entry into our API shape
//
// Kitsu uses JSON:API format — all fields live under anime.attributes.
// ─────────────────────────────────────────────────────────────────────────────
const transformKitsuAnime = (anime) => ({
  id:             anime.id,
  title:          anime.attributes.canonicalTitle       ?? null,
  synopsis:       anime.attributes.synopsis             ?? null,
  image:          anime.attributes.posterImage?.large   ?? null,
  bannerImage:    anime.attributes.coverImage?.original ?? null,
  rating:         anime.attributes.averageRating        ?? null,
  episodes:       anime.attributes.episodeCount         ?? null,
  ageRating:      anime.attributes.ageRating            ?? null,
  ageRatingGuide: anime.attributes.ageRatingGuide       ?? null,
  status:         anime.attributes.status               ?? null,
  startDate:      anime.attributes.startDate            ?? null,
});

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
