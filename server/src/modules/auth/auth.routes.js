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
router.put("/me", authController.updateMe);
router.post("/change-password", authController.changePassword);

// Avatar upload
const multer = require("multer");
const upload = multer({ dest: "uploads/avatars/" });
router.post("/avatar", upload.single("avatar"), authController.uploadAvatar);

module.exports = router;
