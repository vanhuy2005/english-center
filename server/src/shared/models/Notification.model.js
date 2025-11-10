const mongoose = require("mongoose");

/**
 * Notification Schema
 * Hệ thống thông báo cho tất cả users
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "announcement", // Thông báo chung
        "request_response", // Phản hồi yêu cầu
        "payment_reminder", // Nhắc nhở học phí
        "grade_published", // Công bố điểm
        "class_schedule", // Thông báo lịch học
        "attendance_alert", // Cảnh báo vắng mặt
        "system", // Thông báo hệ thống
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String, // URL để navigate khi click
      trim: true,
    },
    relatedModel: {
      type: String, // "Request", "Finance", "Grade", etc.
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date, // Tự động xóa sau thời gian nhất định
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  return this.create(data);
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function (
  notificationIds,
  userId
) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: userId,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = async function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate },
  });
};

module.exports = mongoose.model("Notification", notificationSchema);
