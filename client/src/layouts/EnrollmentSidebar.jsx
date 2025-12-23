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
  Users,
  ClipboardList,
  School,
  ChevronRight,
  BookOpen,
  UserPlus,
  BarChart3,
  Search,
  GraduationCap
} from "lucide-react";

/**
 * Enrollment Staff Sidebar - Polished & Consistent Theme
 */
export const EnrollmentSidebar = ({ menuItems = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // --- LOGIC MAP ICON DỰA TRÊN PATH (Tự động & Đồng bộ) ---
  const getMenuIcon = (path) => {
    const p = path.toLowerCase();

    // Dashboard
    if (p === "/enrollment" || p.includes("dashboard")) return <LayoutDashboard size={20} />;
    
    // Quản lý học viên
    if (p.includes("students/search")) return <Search size={20} />;
    if (p.includes("students")) return <Users size={20} />;
    
    // Xử lý yêu cầu
    if (p.includes("requests")) return <ClipboardList size={20} />;
    
    // Quản lý lớp học
    if (p.includes("classes")) return <School size={20} />;
    
    // Báo cáo
    if (p.includes("reports")) return <BarChart3 size={20} />;
    
    // Default
    return <BookOpen size={20} />;
  };

  const isActive = (path) => {
    if (location.pathname === path) return true;
    // Xử lý active cho route con (trừ root path)
    if (path !== "/" && path !== "" && location.pathname.startsWith(path)) {
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

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 shadow-xl z-50 flex flex-col transition-all duration-300 font-sans">
        
        {/* --- Brand Header --- */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-primary)] rounded-lg text-white shadow-md flex items-center justify-center">
                 <GraduationCap size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-lg font-extrabold text-[var(--color-primary)] tracking-tight leading-none">
                  ENGLISH HUB
                </span>
                <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">
                  ENROLLMENT PORTAL
                </span>
              </div>
           </div>
        </div>

        {/* --- User Info Section --- */}
        <div className="p-5 pb-2">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100/80">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-bold shadow-sm text-sm">
                {user?.fullName?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-bold text-[var(--color-primary)] truncate">
                {user?.fullName || "Nhân Viên"}
              </p>
              <p className="text-[11px] text-gray-500 truncate font-medium">
                Role: <span className="text-[var(--color-secondary)]">Ghi Danh</span>
              </p>
            </div>
          </div>
        </div>

        {/* --- Navigation Menu --- */}
        <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto custom-scrollbar">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <h3 className="px-4 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const IconComponent = getMenuIcon(item.path); // Tự động lấy icon

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        "group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                        active
                          ? "bg-[var(--color-primary)] text-white shadow-md shadow-blue-900/10"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                      )}
                    >
                      {/* Active Indicator Bar */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[var(--color-secondary)] rounded-r-full"></div>
                      )}

                      <span className={clsx(
                         "mr-3 transition-transform duration-200 shrink-0",
                         active ? "text-[var(--color-secondary)]" : "text-gray-400 group-hover:text-[var(--color-secondary)] group-hover:scale-110"
                      )}>
                        {IconComponent}
                      </span>
                      
                      <span className="flex-1 truncate tracking-wide">{item.label}</span>
                      
                      {active && <ChevronRight size={16} className="text-white/30" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* --- Footer Actions --- */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30">
          <div className="space-y-1">
             {/* Change Password */}
             <button
                onClick={() => setShowPasswordDialog(true)}
                className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-[var(--color-primary)] hover:shadow-sm transition-all group"
             >
                <Key size={18} className="mr-3 text-gray-400 group-hover:text-[var(--color-secondary)] transition-colors" />
                <span className="flex-1 text-left">Đổi mật khẩu</span>
                {user?.isFirstLogin && (
                   <AlertCircle size={16} className="text-[var(--color-danger)] animate-pulse" />
                )}
             </button>

             {/* Logout */}
             <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-[var(--color-danger)] transition-all group"
             >
                <LogOut size={18} className="mr-3 text-gray-400 group-hover:text-[var(--color-danger)] transition-colors" />
                <span className="flex-1 text-left">Đăng xuất</span>
             </button>
          </div>
          
          <div className="mt-4 text-center">
             <p className="text-[10px] text-gray-400 font-medium">
               © 2024 English Hub System
             </p>
          </div>
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

export default EnrollmentSidebar;