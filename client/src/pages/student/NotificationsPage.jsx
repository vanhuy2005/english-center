import { useState, useEffect } from "react";
import { notificationService } from "../../services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/common";
import { Badge } from "@components/common";
import { Bell, CheckCircle, AlertCircle, Info, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getMyNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      toast.error("Không thể tải thông báo!");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      toast.success("Đã đánh dấu là đã đọc!");
    } catch (error) {
      toast.error("Không thể cập nhật!");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success("Đã đánh dấu tất cả là đã đọc!");
    } catch (error) {
      toast.error("Không thể cập nhật!");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông Báo</h1>
          <p className="text-gray-600">
            Bạn có {unreadCount} thông báo chưa đọc
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            filter === "unread"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            filter === "read"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Đã đọc ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Không có thông báo nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`${
                !notification.read
                  ? "border-l-4 border-l-blue-600 bg-blue-50"
                  : "hover:shadow-md"
              } transition-shadow cursor-pointer`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge className="bg-red-500 hover:bg-red-600 flex-shrink-0">
                          Mới
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(notification.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
