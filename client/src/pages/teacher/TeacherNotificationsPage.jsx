import React, { useState, useEffect } from "react";
import { Card, Loading, Badge, Button } from "@components/common";
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import api from "@services/api";
import { toast } from "react-hot-toast";

/**
 * Teacher Notifications Page - View and manage notifications
 */
const TeacherNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/teachers/notifications", {
        params: filter !== "all" ? { status: filter } : {},
      });
      setNotifications(response.data?.data?.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/teachers/notifications/${notificationId}/read`);
      fetchNotifications();
      toast.success("Đã đánh dấu đã đọc");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Không thể cập nhật");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/api/teachers/notifications/read-all");
      fetchNotifications();
      toast.success("Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Không thể cập nhật");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/api/teachers/notifications/${notificationId}`);
      fetchNotifications();
      toast.success("Đã xóa thông báo");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Không thể xóa");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      success: <CheckCircle className="w-5 h-5 text-green-600" />,
      warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      error: <AlertCircle className="w-5 h-5 text-red-600" />,
      info: <Info className="w-5 h-5 text-blue-600" />,
    };
    return icons[type] || icons.info;
  };

  const getNotificationColor = (type) => {
    const colors = {
      success: "bg-green-50 border-green-200",
      warning: "bg-yellow-50 border-yellow-200",
      error: "bg-red-50 border-red-200",
      info: "bg-blue-50 border-blue-200",
    };
    return colors[type] || colors.info;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Thông Báo
          </h1>
          <p className="text-gray-600 mt-1">Quản lý thông báo và cập nhật</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="small" onClick={handleMarkAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "unread", "read"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status === "all"
              ? "Tất cả"
              : status === "unread"
              ? "Chưa đọc"
              : "Đã đọc"}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Không có thông báo nào</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`p-4 border-l-4 ${getNotificationColor(
                notification.type
              )} ${notification.isRead ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    {!notification.isRead && <Badge variant="info">Mới</Badge>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {!notification.isRead && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Đánh dấu đã đọc
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(notification._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {notifications.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng thông báo</p>
              <p className="text-2xl font-bold text-blue-600">
                {notifications.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chưa đọc</p>
              <p className="text-2xl font-bold text-red-600">
                {notifications.filter((n) => !n.isRead).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã đọc</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter((n) => n.isRead).length}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeacherNotificationsPage;
