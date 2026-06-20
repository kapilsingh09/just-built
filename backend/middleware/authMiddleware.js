import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * verifyJWT — Authentication middleware
 *
 * Reads the Access Token from:
 *   1. Authorization header:  "Bearer <token>"
 *   2. Fallback: req.cookies.accessToken  (optional convenience)
 *
 * On success: attaches req.user (without password / refreshToken)
 * On failure: returns 401
 */
export const verifyJWT = async (req, res, next) => {
  try {
    // ── Extract token ─────────────────────────────────────────────────────────
    const authHeader = req.headers["authorization"];
    const token =
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null) ?? req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // ── Verify signature + expiry ─────────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Access token has expired. Please refresh."
          : "Invalid access token.";
      return res.status(401).json({ success: false, message });
    }

    // ── Attach user to request ────────────────────────────────────────────────
    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token is no longer valid.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[verifyJWT]", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
