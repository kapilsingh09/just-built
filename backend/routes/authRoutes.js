import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/authController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/register", register);          // POST /api/auth/register
router.post("/login", login);                // POST /api/auth/login
router.post("/refresh-token", refreshToken); // POST /api/auth/refresh-token
router.post("/logout", logout);              // POST /api/auth/logout

// ─── Protected Route Example ──────────────────────────────────────────────────
// Apply verifyJWT middleware to any route that requires authentication
router.get("/me", verifyJWT, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;
