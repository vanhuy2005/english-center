const express = require("express");
const router = express.Router();
const { auth } = require("../../../middleware/auth");
const notificationController = require("./notification.controller");

// All notification routes require authentication
router.use(auth);

// Get my notifications
router.get("/", notificationController.getMyNotifications);

// Mark notifications as read (batch - from client)
router.patch("/mark-read", notificationController.markMultipleAsRead);

// Mark notification as read (single)
router.put("/:id/read", notificationController.markAsRead);

// Mark all as read
router.put("/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

// Delete all notifications
router.delete("/", notificationController.deleteAllNotifications);

module.exports = router;
