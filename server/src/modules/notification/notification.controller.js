const Notification = require("../../shared/models/Notification.model");

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, page = 1, unreadOnly = false } = req.query;

    const query = { recipient: userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tải thông báo",
    });
  }
};

exports.markMultipleAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (notificationIds === "all") {
      // Mark all as read
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return res.json({
        success: true,
        message: "Đã đánh dấu tất cả thông báo đã đọc",
      });
    }

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: "notificationIds phải là một mảng",
      });
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds }, recipient: req.user._id },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: "Đã đánh dấu thông báo đã đọc",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật thông báo",
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Thông báo không tồn tại",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật thông báo",
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: "Đánh dấu tất cả đã đọc",
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật thông báo",
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Thông báo không tồn tại",
      });
    }

    res.json({
      success: true,
      message: "Xóa thông báo thành công",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa thông báo",
    });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ userId });

    res.json({
      success: true,
      message: "Xóa tất cả thông báo thành công",
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa thông báo",
    });
  }
};
