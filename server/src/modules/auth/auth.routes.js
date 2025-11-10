const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { protect } = require("../../shared/middleware/auth.middleware");
const {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} = require("./rateLimiters");

// Public routes
router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/refresh-token", refreshLimiter, authController.refreshToken);

// Protected routes
router.use(protect);
router.post("/logout", authController.logout);
router.get("/me", authController.getMe);
router.put("/change-password", authController.changePassword);

module.exports = router;
