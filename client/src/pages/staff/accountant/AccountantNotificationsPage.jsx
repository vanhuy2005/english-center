import { useState, useEffect } from "react";
import api from "@services/api";
import { Card, Loading, Badge } from "@components/common";
import { Bell } from "lucide-react";

const AccountantNotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications");
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông Báo</h1>
          <p className="text-gray-600 mt-1">Danh sách thông báo của bạn</p>
        </div>
      </div>

      <Card>
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {!notification.isRead && <Badge variant="primary">Mới</Badge>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Không có thông báo</p>
        )}
      </Card>
    </div>
  );
};

export default AccountantNotificationsPage;
