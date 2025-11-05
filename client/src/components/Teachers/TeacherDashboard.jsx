import React, { useState } from "react";
import "./TeacherDashboard.css";
import TeacherInfo from "./TeacherInfo";
import TeacherNotification from "./TeacherNotification";
import TeacherClasses from "./TeacherClasses";
import AttendanceManagement from "./AttendanceManagement";
import StudentResults from "./StudentResults";
import TeacherDashboardHome from "./TeacherDashboardHome";

function TeacherDashboard({ teacher, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Trang Chủ", icon: "📊", category: "main" },
    { id: "info", label: "Thông Tin Giáo Viên", icon: "👤", category: "main" },
    { id: "notification", label: "Thông Báo", icon: "📢", category: "inquiry" },
    { id: "classes", label: "Lớp Học", icon: "📚", category: "inquiry" },
    { id: "attendance", label: "Điểm Danh", icon: "✓", category: "inquiry" },
    {
      id: "results",
      label: "Kết Quả Học Viên",
      icon: "📈",
      category: "online",
    },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <TeacherDashboardHome teacher={teacher} />;
      case "info":
        return <TeacherInfo teacher={teacher} />;
      case "notification":
        return <TeacherNotification />;
      case "classes":
        return <TeacherClasses />;
      case "attendance":
        return <AttendanceManagement />;
      case "results":
        return <StudentResults />;
      default:
        return <TeacherDashboardHome teacher={teacher} />;
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="teacher-sidebar">
        <div className="teacher-profile-section">
          <div className="teacher-avatar">👨‍🏫</div>
          <div className="teacher-profile-info">
            <h3>Trang Cá Nhân</h3>
            <p>{teacher?.fullName}</p>
            <span className="teacher-id">{teacher?.teacherId}</span>
          </div>
        </div>

        <nav className="teacher-menu">
          <div className="menu-section">
            <h4 className="menu-title">TRANG CHỦ</h4>
            {menuItems
              .filter((item) => item.category === "main")
              .map((item) => (
                <button
                  key={item.id}
                  className={`menu-item ${
                    activeMenu === item.id ? "active" : ""
                  }`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
          </div>

          <div className="menu-section">
            <h4 className="menu-title">TRA CỨU THÔNG TIN</h4>
            {menuItems
              .filter((item) => item.category === "inquiry")
              .map((item) => (
                <button
                  key={item.id}
                  className={`menu-item ${
                    activeMenu === item.id ? "active" : ""
                  }`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
          </div>

          <div className="menu-section">
            <h4 className="menu-title">CHỨC NĂNG TRỰC TUYẾN</h4>
            {menuItems
              .filter((item) => item.category === "online")
              .map((item) => (
                <button
                  key={item.id}
                  className={`menu-item ${
                    activeMenu === item.id ? "active" : ""
                  }`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
          </div>
        </nav>

        <button className="teacher-logout-btn" onClick={onLogout}>
          ❌ Đăng xuất
        </button>
      </div>

      <div className="teacher-main-content">{renderContent()}</div>
    </div>
  );
}

export default TeacherDashboard;
