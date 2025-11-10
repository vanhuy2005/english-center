import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { useAuth } from "@hooks";
import ChangePasswordDialog from "../components/common/ChangePasswordDialog";
import {
  User,
  LogOut,
  Key,
  AlertCircle,
  Target,
  UserCircle,
  Bell,
  Calendar,
  DollarSign,
  Award,
  BookOpen,
  RefreshCw,
  ChevronRight,
  Edit,
} from "lucide-react";

/**
 * Modern Left Sidebar Component - Always Visible
 */
export const StudentSidebar = ({ menuItems = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      logout();
      navigate("/login");
    }
  };

  // Icon mapping
  const iconMap = {
    "📊": <Target className="w-5 h-5" />,
    "👤": <UserCircle className="w-5 h-5" />,
    "🔔": <Bell className="w-5 h-5" />,
    "📅": <Calendar className="w-5 h-5" />,
    "💵": <DollarSign className="w-5 h-5" />,
    "💰": <DollarSign className="w-5 h-5" />,
    "🏆": <Award className="w-5 h-5" />,
    "📝": <BookOpen className="w-5 h-5" />,
    "✏️": <Edit className="w-5 h-5" />,
    "🔄": <RefreshCw className="w-5 h-5" />,
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 shadow-lg z-40 flex flex-col">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="text-center">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              hocVienPage
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.fullName || "Nguyễn Văn An"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Mã học viên: {user?.profile?.studentCode || "SV001"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <h3 className="px-3 mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isItemActive = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        "group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                        isItemActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-red-50 hover:text-red-700"
                      )}
                    >
                      <span
                        className={clsx(
                          "transition-transform group-hover:scale-110",
                          isItemActive ? "scale-110 text-white" : ""
                        )}
                      >
                        {iconMap[item.icon] || item.icon}
                      </span>
                      <div className="flex-1 ml-3 min-w-0">
                        <div className="font-medium">{item.label}</div>
                        {item.description && !isItemActive && (
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {isItemActive && (
                        <ChevronRight className="w-4 h-4 ml-2" />
                      )}
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-2">
          {/* Change Password */}
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors group"
          >
            <Key className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-600 transition-colors" />
            <span className="flex-1 text-left">Đổi mật khẩu</span>
            {user?.isFirstLogin && (
              <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors group"
          >
            <LogOut className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
            <span className="flex-1 text-left">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </>
  );
};

export default StudentSidebar;
