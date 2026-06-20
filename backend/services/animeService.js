import * as redisService from "./redisService.js";

const JIKAN_BASE_URL  = process.env.JIKAN_BASE_URL  || "https://api.jikan.moe/v4";
const ANIME_CACHE_TTL = parseInt(process.env.ANIME_CACHE_TTL, 10) || 3600; // 1 hour

// ─── Helper: Get current season label (spring / summer / fall / winter) ────────
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 1  && month <= 3)  return "winter";
  if (month >= 4  && month <= 6)  return "spring";
  if (month >= 7  && month <= 9)  return "summer";
  return "fall";
};

// ─── Helper: Transform a single raw Jikan anime entry into our API shape ───────
const transformAnime = (data) => ({
  id:          data.mal_id,
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
});

// ─────────────────────────────────────────────────────────────────────────────
// getPopularAnime
// Fetches trending / popular anime for the current season & year.
// Uses Jikan's /seasons/now endpoint, sorted by score descending.
//
// Cache-aside pattern:
//   1. Check Redis (key: anime:popular:{year}:{season})
//      → Cache HIT  → return immediately
//   2. Cache MISS   → fetch from Jikan → transform → store → return
// ─────────────────────────────────────────────────────────────────────────────
export const getPopularAnime = async () => {
  const year     = new Date().getFullYear();
  const season   = getCurrentSeason();
  const cacheKey = `anime:popular:${year}:${season}`;

  // ── Step 1: Check Redis cache ─────────────────────────────────────────────
  const cached = await redisService.get(cacheKey);

  if (cached) {
    // Cache HIT — serve from Redis without touching the external API
    console.log(`[animeService] Cache HIT for key: ${cacheKey}`);
    return { data: cached, source: "cache", year, season };
  }

  // ── Step 2: Cache MISS — fetch current season anime from Jikan ───────────
  console.log(`[animeService] Cache MISS for key: ${cacheKey} — fetching from Jikan API`);

  // /top/anime?filter=airing returns currently airing anime ranked by score/popularity
  // Note: /seasons/now does NOT support filter=bypopularity (causes 400)
  const url      = `${JIKAN_BASE_URL}/top/anime?filter=airing&limit=25`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`Jikan API returned status ${response.status}`);
    error.status = 502;
    throw error;
  }

  const json = await response.json();

  // Guard: ensure data array exists before processing
  if (!Array.isArray(json.data)) {
    const error = new Error("Unexpected response shape from Jikan API");
    error.status = 502;
    throw error;
  }

  // ── Step 3: Deduplicate by mal_id using a Map ─────────────────────────────
  // Jikan can occasionally return the same title more than once across pages.
  // A Map keyed on mal_id keeps only the first occurrence of each unique anime.
  const uniqueAnimeMap = new Map();
  for (const entry of json.data) {
    if (!uniqueAnimeMap.has(entry.mal_id)) {
      uniqueAnimeMap.set(entry.mal_id, entry);
    }
  }
  const uniqueEntries = Array.from(uniqueAnimeMap.values());

  // ── Step 4: Transform the deduplicated entries ────────────────────────────
  const transformed = uniqueEntries.map(transformAnime);

  // ── Step 4: Store in Redis with a TTL of 1 hour ───────────────────────────
  await redisService.set(cacheKey, transformed, ANIME_CACHE_TTL);
  console.log(`[animeService] Stored key: ${cacheKey} in cache (TTL: ${ANIME_CACHE_TTL}s)`);

  return { data: transformed, source: "api", year, season };
};
