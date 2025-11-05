import React, { useState } from "react";
import "./StudentDashboard.css";
import Dashboard from "./Dashboard";
import StudentInfo from "./StudentInfo";
import StudentNotification from "./StudentNotification";
import StudentSchedule from "./StudentSchedule";
import StudentTuition from "./StudentTuition";
import StudentResults from "./StudentResults";
import OnlineFeatures from "./OnlineFeatures";
import CourseProgress from "./CourseProgress";
import LeaveRequest from "./LeaveRequest";

function StudentDashboard({ student, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Bảng Điều Khiển", icon: "📊" },
    { id: "progress", label: "Tiến độ khóa học", icon: "📚" },
    { id: "notification", label: "Thông báo", icon: "📢" },
    { id: "schedule", label: "Lịch học", icon: "📅" },
    { id: "tuition", label: "Tài chính sinh viên", icon: "💰" },
    { id: "results", label: "Kết quả học tập", icon: "📊" },
    { id: "online", label: "Đăng kí khóa học", icon: "🌐" },
    { id: "leave", label: "Xin nghỉ và học bù", icon: "📋" },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <Dashboard student={student} />;
      case "progress":
        return <CourseProgress student={student} />;
      case "info":
        return <StudentInfo student={student} />;
      case "notification":
        return <StudentNotification />;
      case "schedule":
        return <StudentSchedule />;
      case "tuition":
        return <StudentTuition />;
      case "results":
        return <StudentResults />;
      case "online":
        return <OnlineFeatures />;
      case "leave":
        return <LeaveRequest />;
      default:
        return <Dashboard student={student} />;
    }
  };

  return (
    <div className="student-dashboard">
      <div className="sidebar">
        <div className="profile-section">
          <div className="avatar">👤</div>
          <div className="profile-info">
            <h3>Trang Cá Nhân</h3>
            <p>{student?.fullName}</p>
            <span className="student-id">Menu description.</span>
          </div>
        </div>

        <nav className="menu">
          <div className="menu-section">
            <h4 className="menu-title">BẢNG ĐIỀU KHIỂN</h4>
            {menuItems.slice(0, 2).map((item) => (
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

          <button
            className="menu-item highlight"
            onClick={() => setActiveMenu("info")}
          >
            <span className="menu-icon">🔐</span>
            <span>Thông tin cá nhân</span>
          </button>

          <div className="menu-section">
            <h4 className="menu-title">TRA CỨU THÔNG TIN</h4>
            {menuItems.slice(3, 6).map((item) => (
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
            {menuItems.slice(6).map((item) => (
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

        <button className="logout-btn" onClick={onLogout}>
          ❌ Đăng xuất
        </button>
      </div>

      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default StudentDashboard;
