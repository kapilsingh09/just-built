import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

// ─── Helper: set refresh token as HttpOnly cookie ─────────────────────────────
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,                              // Not accessible via JS
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 days in ms
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic field validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Check for duplicate user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists." });
    }

    // Create user — password hashed in pre-save hook
    const user = await User.create({ username, email, password });

    // Issue tokens
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Persist refresh token in DB (so we can invalidate on logout)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Send refresh token in cookie, access token in body
    setRefreshCookie(res, refreshToken);

    const safeUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      accessToken,
      user: safeUser,
    });
  } catch (error) {
    console.error("[register]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Issue tokens
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Persist refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
    });
  } catch (error) {
    console.error("[login]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh-token
// Reads the HttpOnly cookie, validates the refresh token, issues a new access token
// ─────────────────────────────────────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided." });
    }

    // Verify signature + expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(403).json({ success: false, message: "Invalid or expired refresh token." });
    }

    // Ensure token matches what we stored (prevents reuse after logout)
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ success: false, message: "Refresh token has been revoked." });
    }

    // Issue a fresh access token (optionally rotate refresh token too)
    const newAccessToken = generateAccessToken(user._id);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("[refreshToken]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Clears the cookie and removes the refresh token from DB
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      // Revoke token in DB so it can't be replayed
      await User.findOneAndUpdate(
        { refreshToken: token },
        { $set: { refreshToken: null } }
      );
    }

    // Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("[logout]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
