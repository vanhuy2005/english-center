import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { useAuth, useLanguage } from "@hooks";
import ChangePasswordDialog from "../components/common/ChangePasswordDialog";
import { User, LogOut, Key, AlertCircle } from "lucide-react";

/**
 * Modern Student Sidebar Component
 */
export const Sidebar = ({ menuItems = [], collapsed = false, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { t } = useLanguage();
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

  return (
    <>
      <aside className="fixed right-0 top-0 h-screen w-72 bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="text-center">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              hocVienPage
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.fullName || "Nguyễn Văn An"}
                </p>
                <p className="text-xs text-gray-500">
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
                <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      "group flex items-start px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-red-50 hover:text-red-700"
                    )}
                  >
                    <span
                      className={clsx(
                        "text-lg mr-3 transition-transform group-hover:scale-110",
                        isActive(item.path) ? "scale-110" : ""
                      )}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
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
            <Key className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-600" />
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

export default Sidebar;
