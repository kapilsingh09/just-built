import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// ─── Singleton Redis client ────────────────────────────────────────────────────
const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    // Stop retrying after 3 attempts so we don't spam the logs
    reconnectStrategy: (retries) => {
      if (retries >= 3) {
        console.warn("⚠️   Redis: max reconnect attempts reached. Cache will be disabled.");
        return false; // stop retrying
      }
      return Math.min(retries * 200, 2000); // backoff: 200ms, 400ms, 600ms
    },
  },
});

// ─── Connection Event Handlers ─────────────────────────────────────────────────
redisClient.on("connect", () => {
  console.log("✅  Connected to Redis");
});

redisClient.on("error", (err) => {
  // Log once, not every retry cycle
  if (err.code === "ECONNREFUSED") {
    console.warn(`[Redis] Connection refused at ${REDIS_URL}. Cache will be skipped.`);
  } else {
    console.error("[Redis Error]", err.message);
  }
});

redisClient.on("reconnecting", () => {
  console.warn("⚠️   Redis reconnecting...");
});

// ─── Connect and export ────────────────────────────────────────────────────────
export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    // Don't crash the server if Redis is unavailable — cache will be bypassed
    console.warn("[Redis] Could not connect. App will run without caching.");
  }
  return redisClient;
}

export { redisClient };
