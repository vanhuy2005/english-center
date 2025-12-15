import api from "./api";

export const notificationAPI = {
  // Get my notifications
  getMyNotifications: (params) => {
    console.log("🔔 Fetching notifications...");
    return api.get("/notifications", { params });
  },

  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put("/notifications/read-all"),

  // Delete notification
  deleteNotification: (id) => api.delete(`/notifications/${id}`),

  // Delete all
  deleteAll: () => api.delete("/notifications"),
};
