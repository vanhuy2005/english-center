import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "@components/common";
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
  Clock,
  MessageSquare
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
      
      // GỌI API THỰC TẾ
      const data = await getNotifications();
      
      // Kiểm tra dữ liệu trả về có phải mảng không để tránh crash
      setNotifications(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      setError("Không thể tải thông báo. Vui lòng thử lại sau.");
      // Không fallback về mock data nữa
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      // Cập nhật UI optimistic (phản hồi ngay lập tức)
      setNotifications((prev) =>
        prev.map((notif) =>
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
      // Cập nhật UI optimistic
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Helper: Style icon và background
  const getNotificationStyle = (type) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle size={24} className="text-[var(--color-secondary)]" />,
          bgIcon: "bg-[var(--color-secondary)]/10"
        };
      case "warning":
        return {
          icon: <AlertCircle size={24} className="text-amber-500" />,
          bgIcon: "bg-amber-50"
        };
      case "error":
        return {
          icon: <AlertCircle size={24} className="text-[var(--color-danger)]" />,
          bgIcon: "bg-red-50"
        };
      case "info":
      default:
        return {
          icon: <Info size={24} className="text-[var(--color-primary)]" />,
          bgIcon: "bg-blue-50"
        };
    }
  };

  if (loading) {
    return <Loading />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 md:p-8 font-sans">
      <div className="w-full mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <Bell size={20} className="text-white" />
                </div>
                Thông Báo
              </h1>
              <p className="text-gray-500 text-sm mt-1 ml-12">
                {unreadCount > 0 ? (
                  <>Bạn có <span className="font-bold text-[var(--color-secondary)]">{unreadCount}</span> thông báo mới chưa đọc</>
                ) : (
                  "Bạn đã đọc hết các thông báo"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert - Chỉ hiện khi API lỗi thực sự */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-[var(--color-danger)]" size={20} />
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const style = getNotificationStyle(notification.type);
              
              return (
                <div
                  key={notification._id}
                  className={`
                    group relative bg-white rounded-xl p-5 shadow-[var(--shadow-card)] 
                    hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300
                    w-full
                    ${!notification.isRead ? "bg-blue-50/20" : ""}
                  `}
                >
                  <div className="flex items-start gap-5">
                    {/* Icon Box */}
                    <div className={`flex-shrink-0 p-3 rounded-full ${style.bgIcon} mt-0.5`}>
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-base font-bold ${!notification.isRead ? "text-[var(--color-primary)]" : "text-gray-600"}`}>
                          {notification.title}
                        </h3>
                        
                        {/* Status Badge & Timestamp */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="flex items-center text-xs text-gray-400 gap-1">
                             <Clock size={12} />
                             {new Date(notification.createdAt).toLocaleDateString("vi-VN", {
                                day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit"
                             })}
                          </span>
                          {!notification.isRead && (
                            <span className="px-2.5 py-1 bg-[var(--color-secondary)] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm animate-pulse">
                              Mới
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm leading-relaxed ${!notification.isRead ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                        {notification.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-2 rounded-lg text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[var(--color-danger)] hover:bg-red-50 transition-colors"
                        title="Xóa thông báo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <MessageSquare size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Hiện tại chưa có thông báo nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;