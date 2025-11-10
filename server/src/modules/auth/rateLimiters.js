const rateLimit = require("express-rate-limit");

// Stricter limit for login (e.g., 5 requests per 10 minutes)
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message:
    "Too many login attempts from this IP, please try again after 10 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate limit for register (e.g., 10 requests per hour)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message:
    "Too many registration attempts from this IP, please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Conservative limit for refresh-token (e.g., 30 requests per hour)
const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message:
    "Too many token refresh requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
};
