import jwt from "jsonwebtoken";

/**
 * Generates a short-lived Access Token (default: 15 minutes)
 * Returned in response body — client stores in memory / Authorization header
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" }
  );
};

/**
 * Generates a long-lived Refresh Token (default: 7 days)
 * Stored securely in an HttpOnly cookie
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
  );
};