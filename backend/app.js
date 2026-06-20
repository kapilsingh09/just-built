import "dotenv/config";           // Must be first — loads .env before anything else
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./db/mongoDb.js";
import { connectRedis } from "./db/redis.js";
import authRoutes from "./routes/authRoutes.js";
import animeRoutes from "./routes/animeRoutes.js";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,             // Required to send/receive cookies cross-origin
}));
app.use(express.json());         // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());         // Parse cookies (needed for refreshToken cookie)

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running 🚀" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/anime", animeRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Global Error]", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Connect DB then Start Server ─────────────────────────────────────────────
await connectDB();
await connectRedis();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  Server is running on http://localhost:${PORT}`);
});