import React, { useState, useEffect } from "react";

function DirectorDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    totalTeachers: 0,
    activeCourses: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Gọi API để lấy thống kê
    try {
      // const response = await fetch('/api/stats');
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="director-dashboard">
      <h2>Bảng điều khiển - Giám đốc</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng số học viên</h3>
          <p className="stat-value">150</p>
        </div>
        <div className="stat-card">
          <h3>Doanh thu</h3>
          <p className="stat-value">500,000,000đ</p>
        </div>
        <div className="stat-card">
          <h3>Giảng viên</h3>
          <p className="stat-value">12</p>
        </div>
        <div className="stat-card">
          <h3>Khóa học đang hoạt động</h3>
          <p className="stat-value">8</p>
        </div>
      </div>

      <div className="reports-section">
        <h3>Báo cáo</h3>
        <div className="report-buttons">
          <button>Báo cáo học viên</button>
          <button>Báo cáo tài chính</button>
          <button>Báo cáo nhân sự</button>
          <button>Báo cáo kết quả học tập</button>
        </div>
      </div>

      <div className="management-section">
        <h3>Quản lý hệ thống</h3>
        <ul>
          <li>
            <a href="#students">Quản lý học viên</a>
          </li>
          <li>
            <a href="#staff">Quản lý nhân viên</a>
          </li>
          <li>
            <a href="#teachers">Quản lý giảng viên</a>
          </li>
          <li>
            <a href="#courses">Quản lý khóa học</a>
          </li>
          <li>
            <a href="#classes">Quản lý lớp học</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default DirectorDashboard;
