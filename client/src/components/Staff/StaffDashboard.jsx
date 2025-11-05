import React, { useState } from "react";
import "./StaffDashboard.css";

function StaffDashboard({ staff, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Trang Chủ", icon: "📊", category: "main" },
    { id: "info", label: "Thông Tin Nhân Viên", icon: "👤", category: "main" },
    {
      id: "students",
      label: "Quản Lý Học Viên",
      icon: "👥",
      category: "inquiry",
    },
    {
      id: "finances",
      label: "Quản Lý Tài Chính",
      icon: "💰",
      category: "inquiry",
    },
    { id: "enrollment", label: "Ghi Danh", icon: "📝", category: "inquiry" },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <StaffDashboardHome staff={staff} />;
      case "info":
        return <StaffInfo staff={staff} />;
      case "students":
        return <StudentManagement />;
      case "finances":
        return <FinanceManagement />;
      case "enrollment":
        return <EnrollmentManagement />;
      default:
        return <StaffDashboardHome staff={staff} />;
    }
  };

  return (
    <div className="staff-dashboard">
      <div className="staff-sidebar">
        <div className="staff-profile-section">
          <div className="staff-avatar">👨‍💼</div>
          <div className="staff-profile-info">
            <h3>Trang Cá Nhân</h3>
            <p>{staff?.fullName}</p>
            <span className="staff-id">{staff?.staffId}</span>
          </div>
        </div>

        <nav className="staff-menu">
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
            <h4 className="menu-title">QUẢN LÝ</h4>
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
        </nav>

        <button className="staff-logout-btn" onClick={onLogout}>
          ❌ Đăng xuất
        </button>
      </div>

      <div className="staff-main-content">{renderContent()}</div>
    </div>
  );
}

function StaffDashboardHome({ staff }) {
  return (
    <div className="staff-home-container">
      <h2>📊 Bảng Điều Khiển Nhân Viên</h2>
      <p>Chào mừng {staff?.fullName} đến với hệ thống quản lý!</p>
    </div>
  );
}

function StaffInfo({ staff }) {
  return (
    <div className="staff-info-container">
      <h2>👤 Thông Tin Nhân Viên</h2>
      <div className="info-card">
        <p>
          <strong>Mã Nhân Viên:</strong> {staff?.staffId}
        </p>
        <p>
          <strong>Họ và Tên:</strong> {staff?.fullName}
        </p>
        <p>
          <strong>Email:</strong> {staff?.email}
        </p>
        <p>
          <strong>Phòng Ban:</strong> {staff?.department}
        </p>
      </div>
    </div>
  );
}

function StudentManagement() {
  return (
    <div className="management-container">
      <h2>👥 Quản Lý Học Viên</h2>
      <p>Chức năng quản lý học viên</p>
    </div>
  );
}

function FinanceManagement() {
  return (
    <div className="management-container">
      <h2>💰 Quản Lý Tài Chính</h2>
      <p>Chức năng quản lý tài chính</p>
    </div>
  );
}

function EnrollmentManagement() {
  return (
    <div className="management-container">
      <h2>📝 Ghi Danh</h2>
      <p>Chức năng ghi danh học viên</p>
    </div>
  );
}

export default StaffDashboard;
