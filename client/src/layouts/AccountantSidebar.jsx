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
  LayoutDashboard,
  UserCircle,
  Bell,
  Users,
  DollarSign,
  Receipt,
  TrendingUp,
  CreditCard,
  FileText,
  RotateCcw,
  Download,
  ChevronRight,
} from "lucide-react";

/**
 * Accountant Sidebar Component - Professional & Clean Design
 */
export const AccountantSidebar = ({ menuItems = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (
      path !== "/" &&
      path !== "" &&
      location.pathname.startsWith(path + "/")
    ) {
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      logout();
      navigate("/login");
    }
  };

  // Icon mapping - Solid, Professional Icons
  const iconMap = {
    "📊": <LayoutDashboard className="w-5 h-5" />,
    "👤": <UserCircle className="w-5 h-5" />,
    "🔔": <Bell className="w-5 h-5" />,
    "👥": <Users className="w-5 h-5" />,
    "💰": <DollarSign className="w-5 h-5" />,
    "🧾": <Receipt className="w-5 h-5" />,
    "📈": <TrendingUp className="w-5 h-5" />,
    "💳": <CreditCard className="w-5 h-5" />,
    "📝": <FileText className="w-5 h-5" />,
    "↩️": <RotateCcw className="w-5 h-5" />,
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
            Nhân Viên Kế Toán
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.fullName || "Nhân viên"}
              </p>
              <p className="text-xs text-gray-600 truncate">Kế toán</p>
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
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
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
                      <div className="font-semibold">{item.label}</div>
                      {item.description && !isItemActive && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {isItemActive && <ChevronRight className="w-4 h-4 ml-2" />}
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

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </aside>
  );
};

export default AccountantSidebar;
