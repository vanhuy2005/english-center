const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
  createNotification,
  broadcastNotification,
} = require("./notification.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");
const validateObjectId = require("../../shared/middleware/validateObjectId");

// All routes require authentication
router.use(protect);

// Get my notifications
router.route("/").get(getMyNotifications);

// Get unread count
router.route("/unread-count").get(getUnreadCount);

// Mark as read
router.route("/mark-read").patch(markAsRead);

// Create notification (admin/staff only)
router
  .route("/create")
  .post(
    authorize("director", "academic", "enrollment", "accountant"),
    createNotification
  );

// Broadcast notification (director only)
router.route("/broadcast").post(authorize("director"), broadcastNotification);

// Delete notification
router.route("/:id").delete(validateObjectId, deleteNotification);

module.exports = router;
