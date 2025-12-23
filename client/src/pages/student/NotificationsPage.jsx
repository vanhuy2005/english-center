import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Loading } from "@components/common";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "@services/notificationApi";
import {
  Bell,
  ArrowLeft,
  Trash2,
  Check,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📥 Fetching notifications...");

      const data = await getNotifications();
      console.log("✓ Notifications loaded:", data);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      setError("Lỗi tải thông báo");
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const getMockNotifications = () => [
    {
      _id: "notif_1",
      title: "Chào mừng",
      message: "Chào mừng bạn đến với trung tâm tiếng Anh",
      type: "info",
      isRead: false,
      createdAt: new Date(),
    },
    {
      _id: "notif_2",
      title: "Lịch học",
      message: "Lớp English A1 bắt đầu vào thứ Hai tuần tới",
      type: "reminder",
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      return;
    }

    try {
      await deleteNotification(notificationId);
      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "warning":
        return <AlertCircle size={20} className="text-yellow-600" />;
      case "error":
        return <AlertCircle size={20} className="text-red-600" />;
      case "info":
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-l-4 border-l-green-600";
      case "warning":
        return "bg-yellow-50 border-l-4 border-l-yellow-600";
      case "error":
        return "bg-red-50 border-l-4 border-l-red-600";
      case "info":
      default:
        return "bg-blue-50 border-l-4 border-l-blue-600";
    }
  };

  if (loading) {
    return <Loading />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bell size={32} className="text-blue-600" />
                Thông Báo
              </h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0
                  ? `Bạn có ${unreadCount} thông báo chưa đọc`
                  : "Bạn đã đọc hết thông báo"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`${getNotificationColor(
                  notification.type
                )} p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {!notification.isRead && (
                        <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex-shrink-0">
                          Mới
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <Check size={18} className="text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 hover:bg-red-200 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">Không có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
