const Notification = require("../../shared/models/Notification.model");

/**
 * @desc    Get all notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead, priority } = req.query;

    const filter = { recipient: req.user._id };

    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(filter)
      .populate("sender", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông báo",
      error: error.message,
    });
  }
};

/**
 * @desc    Get unread count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đếm thông báo chưa đọc",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark notification(s) as read
 * @route   PATCH /api/notifications/mark-read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body; // Array of IDs or "all"

    if (notificationIds === "all") {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } else if (Array.isArray(notificationIds)) {
      await Notification.markAsRead(notificationIds, req.user._id);
    } else {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
      });
    }

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      message: "Đã đánh dấu đã đọc",
      unreadCount,
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đánh dấu đã đọc",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Đã xóa thông báo",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa thông báo",
      error: error.message,
    });
  }
};

/**
 * @desc    Create notification (Admin only)
 * @route   POST /api/notifications
 * @access  Private (director, staff)
 */
exports.createNotification = async (req, res) => {
  try {
    const {
      recipient,
      recipients, // Array for bulk notifications
      type,
      title,
      message,
      link,
      priority,
      expiresAt,
    } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }

    let notifications = [];

    // Bulk notifications
    if (recipients && Array.isArray(recipients)) {
      const notificationsData = recipients.map((recipientId) => ({
        recipient: recipientId,
        sender: req.user._id,
        type,
        title,
        message,
        link,
        priority: priority || "normal",
        expiresAt,
      }));

      notifications = await Notification.insertMany(notificationsData);
    }
    // Single notification
    else if (recipient) {
      const notification = await Notification.create({
        recipient,
        sender: req.user._id,
        type,
        title,
        message,
        link,
        priority: priority || "normal",
        expiresAt,
      });

      notifications = [notification];
    } else {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chỉ định người nhận",
      });
    }

    res.status(201).json({
      success: true,
      message: `Đã tạo ${notifications.length} thông báo`,
      data: notifications,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo thông báo",
      error: error.message,
    });
  }
};

/**
 * @desc    Broadcast notification to all users or by role
 * @route   POST /api/notifications/broadcast
 * @access  Private (director)
 */
exports.broadcastNotification = async (req, res) => {
  try {
    const { role, type, title, message, link, priority } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }

    const Student = require("../../shared/models/Student.model");
    const Staff = require("../../shared/models/Staff.model");

    let recipients = [];

    if (role === "all") {
      // Get all users
      const [students, staff] = await Promise.all([
        Student.find({}, "_id"),
        Staff.find({}, "_id"),
      ]);
      recipients = [
        ...students.map((s) => s._id),
        ...staff.map((s) => s._id),
      ];
    } else if (role === "student") {
      const students = await Student.find({}, "_id");
      recipients = students.map((s) => s._id);
    } else if (role) {
      // Staff roles: teacher, director, academic, accountant, enrollment
      const staff = await Staff.find({ staffType: role }, "_id");
      recipients = staff.map((s) => s._id);
    }

    // Remove duplicates
    recipients = [...new Set(recipients.map((id) => id.toString()))];

    const notificationsData = recipients.map((recipientId) => ({
      recipient: recipientId,
      sender: req.user._id,
      type,
      title,
      message,
      link,
      priority: priority || "normal",
    }));

    const notifications = await Notification.insertMany(notificationsData);

    res.status(201).json({
      success: true,
      message: `Đã gửi thông báo đến ${notifications.length} người`,
      data: { count: notifications.length },
    });
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi thông báo hàng loạt",
      error: error.message,
    });
  }
};
