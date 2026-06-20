import { redisClient } from "../db/redis.js";

// ─── Redis Service ─────────────────────────────────────────────────────────────
// Reusable wrapper around the Redis client.
// All Redis interactions across the app should go through this service.
// Controllers must NEVER import or use this service directly.
// If Redis is unavailable, all methods gracefully return null / no-op.
// ──────────────────────────────────────────────────────────────────────────────

const isReady = () => redisClient.isOpen && redisClient.isReady;

/**
 * Get a value from Redis by key.
 * Returns the parsed JSON value, or null if the key does not exist or Redis is down.
 */
export const get = async (key) => {
  if (!isReady()) return null;
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.warn(`[redisService] get() failed for key "${key}":`, err.message);
    return null;
  }
};

/**
 * Set a key-value pair in Redis with an optional TTL (in seconds).
 * The value is serialised to JSON before storing.
 * No-op if Redis is unavailable.
 */
export const set = async (key, value, ttlSeconds = null) => {
  if (!isReady()) return;
  try {
    const serialised = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient.set(key, serialised, { EX: ttlSeconds });
    } else {
      await redisClient.set(key, serialised);
    }
  } catch (err) {
    console.warn(`[redisService] set() failed for key "${key}":`, err.message);
  }
};

/**
 * Delete a key from Redis.
 * No-op if Redis is unavailable.
 */
export const del = async (key) => {
  if (!isReady()) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    console.warn(`[redisService] del() failed for key "${key}":`, err.message);
  }
};

