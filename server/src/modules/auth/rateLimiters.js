const rateLimit = require("express-rate-limit");

// Allow disabling rate limits during local development or tests by setting
// DISABLE_RATE_LIMIT=true or when NODE_ENV=development.
const disabled =
  process.env.DISABLE_RATE_LIMIT === "true" ||
  process.env.NODE_ENV === "development";

// Passthrough middleware when disabled
const passThrough = (req, res, next) => next();

const loginLimiter = disabled
  ? passThrough
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per windowMs
      message: "Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút",
      standardHeaders: true,
      legacyHeaders: false,
    });

const registerLimiter = disabled
  ? passThrough
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 requests per hour
      message: "Quá nhiều lần đăng ký, vui lòng thử lại sau 1 giờ",
      standardHeaders: true,
      legacyHeaders: false,
    });

const refreshLimiter = disabled
  ? passThrough
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 requests per windowMs
      message: "Quá nhiều lần làm mới token, vui lòng thử lại sau",
      standardHeaders: true,
      legacyHeaders: false,
    });

module.exports = {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
};
