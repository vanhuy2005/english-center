const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },
    category: {
      type: String,
      enum: ["course", "grade", "attendance", "finance", "request", "system"],
      default: "system",
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Statics
notificationSchema.statics.createNotification = async function (data) {
  return this.create({
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || "info",
    category: data.category || "system",
    relatedId: data.relatedId,
    actionUrl: data.actionUrl,
  });
};

notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ userId, isRead: false });
};

module.exports = mongoose.model("Notification", notificationSchema);
