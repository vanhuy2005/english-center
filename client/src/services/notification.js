import api from "./api";

export const getMyNotifications = (params) => {
  console.log("🔔 Fetching notifications...");
  return api.get("/notifications", { params });
};

export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.put("/notifications/read-all");
};

export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};

export const deleteAllNotifications = () => {
  return api.delete("/notifications");
};
