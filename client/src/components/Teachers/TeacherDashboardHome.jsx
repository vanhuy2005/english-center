import React from "react";

function TeacherDashboardHome({ teacher }) {
  return (
    <div className="teacher-home-container">
      <h2>📊 Bảng Điều Khiển Giáo Viên</h2>

      <div className="teacher-info-cards">
        <div className="info-card-container">
          <div className="info-card">
            <h3>📋 Thông Tin Giáo Viên</h3>

            <div className="info-field">
              <label>Mã Giáo Viên</label>
              <span>{teacher?.teacherId || "GV001"}</span>
            </div>

            <div className="info-field">
              <label>Họ và Tên</label>
              <span>{teacher?.fullName || "John Smith"}</span>
            </div>

            <div className="info-field">
              <label>Ngày Sinh</label>
              <span>{teacher?.dateOfBirth || "Chưa cập nhật"}</span>
            </div>

            <div className="info-field">
              <label>Giới Tính</label>
              <span>{teacher?.gender || "Nam"}</span>
            </div>

            <div className="info-field">
              <label>Chuyên Môn</label>
              <span>
                {teacher?.specialization?.join(", ") || "TOEIC, IELTS"}
              </span>
            </div>

            <div className="info-field">
              <label>Trạng Thái</label>
              <span className="status-active">🟢 Đang Dạy</span>
            </div>
          </div>
        </div>

        <div className="info-card-container">
          <div className="info-card">
            <h3>📞 Thông Tin Liên Lạc</h3>

            <div className="info-field">
              <label>Mã Giáo Viên</label>
              <span>{teacher?.teacherId || "GV001"}</span>
            </div>

            <div className="info-field">
              <label>Họ và Tên</label>
              <span>{teacher?.fullName || "John Smith"}</span>
            </div>

            <div className="info-field">
              <label>Email</label>
              <span>{teacher?.email || "john@example.com"}</span>
            </div>

            <div className="info-field">
              <label>Số Điện Thoại</label>
              <span>{teacher?.phone || "Chưa cập nhật"}</span>
            </div>

            <div className="info-field">
              <label>Địa Chỉ</label>
              <span>{teacher?.address || "Chưa cập nhật"}</span>
            </div>

            <button className="update-info-btn">
              Cập Nhật Thông Tin Cá Nhân
            </button>
          </div>
        </div>
      </div>

      <div className="teacher-stats">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <p className="stat-label">Lớp Đang Dạy</p>
            <p className="stat-value">3</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <p className="stat-label">Tổng Học Viên</p>
            <p className="stat-value">45</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <p className="stat-label">Buổi Học Hôm Nay</p>
            <p className="stat-value">2</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <p className="stat-label">Điểm Danh Hôm Nay</p>
            <p className="stat-value">42/45</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboardHome;
