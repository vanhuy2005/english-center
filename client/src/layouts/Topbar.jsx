import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { useAuth, useLanguage } from "@hooks";
import { notificationService } from "@services";
import { Badge } from "@components/common";

/**
 * Topbar Component
 */
export const Topbar = ({ onMenuToggle, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const userMenuRef = useRef(null);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll({ page: 1, pageSize: 5 });
      setNotifications(data.notifications || []);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count.count || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  useEffect(() => {
    if (!showUserMenu) return;
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 right-0 h-16 bg-white shadow-md z-30 transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="text-sm text-gray-600">
            {useMemo(() => {
              const locale = language || navigator.language || "en-US";
              return new Date().toLocaleDateString(locale, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }, [language])}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title={t("common.language")}
            aria-label="Toggle language"
          >
            <span className="text-lg">{language === "vi" ? "🇻🇳" : "🇬🇧"}</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors relative"
              aria-label="Toggle notifications"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <Badge
                  variant="danger"
                  className="absolute -top-1 -right-1 min-w-[20px] h-5"
                >
                  {unreadCount}
                </Badge>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-primary">
                    {t("notification.notifications")}
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {t("notification.noNotifications")}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleMarkAsRead(notif._id)}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notif.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString(
                            language || navigator.language || "en-US"
                          )}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="text-sm text-primary hover:underline"
                  >
                    {t("notification.viewAll")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Open user menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.fullName}
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  👤 {t("common.profile")}
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  ⚙️ {t("common.settings")}
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-gray-100 rounded-b-lg"
                >
                  🚪 {t("common.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
