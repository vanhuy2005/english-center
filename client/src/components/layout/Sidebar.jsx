import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { LogOut } from "lucide-react";

const Sidebar = ({ menuItems, userRole }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-[#3B9797] text-white flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold">English Center</h1>
        <p className="text-sm text-white/80 mt-1">
          {userRole === "academic" && "Học vụ"}
          {userRole === "accountant" && "Kế toán"}
          {userRole === "enrollment" && "Tuyển sinh"}
          {userRole === "teacher" && "Giảng viên"}
          {userRole === "director" && "Giám đốc"}
        </p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {user?.profile?.fullName?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {user?.profile?.fullName || "User"}
            </p>
            <p className="text-sm text-white/70 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? "bg-white/20 border-l-4 border-white"
                  : "hover:bg-white/10"
              }`
            }
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
