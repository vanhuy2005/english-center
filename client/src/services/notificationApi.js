import api from "./api";

// Mock data
const getMockNotifications = () => [
  {
    _id: "notif_mock_1",
    title: "Chào mừng",
    message: "Chào mừng bạn đến với trung tâm tiếng Anh",
    type: "info",
    isRead: false,
    createdAt: new Date(),
  },
  {
    _id: "notif_mock_2",
    title: "Lịch học",
    message: "Lớp English A1 bắt đầu vào thứ Hai tuần tới",
    type: "reminder",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "notif_mock_3",
    title: "Thanh toán",
    message: "Học phí của bạn đã được xác nhận",
    type: "success",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// Lấy danh sách thông báo
export const getNotifications = async () => {
  try {
    // Thử endpoint 1
    try {
      const response = await api.get("/notifications");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("✓ Notifications from API:", response.data.data);
        return response.data.data;
      }
    } catch (err1) {
      console.log("Endpoint /notifications failed:", err1.response?.status);
    }

    // Thử endpoint 2
    try {
      const response = await api.get("/student/notifications");
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(
          "✓ Notifications from /student/notifications:",
          response.data.data
        );
        return response.data.data;
      }
    } catch (err2) {
      console.log(
        "Endpoint /student/notifications failed:",
        err2.response?.status
      );
    }

    // Trả về mock data nếu cả hai đều fail
    console.log("↪️  Using mock notifications");
    return getMockNotifications();
  } catch (error) {
    console.error("Error getting notifications:", error);
    return getMockNotifications();
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false };
  }
};
