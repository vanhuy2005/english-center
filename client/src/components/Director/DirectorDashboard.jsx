import React, { useState } from "react";
import axios from "axios";
import "./DirectorDashboard.css";

function DirectorDashboard({ director, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const token = localStorage.getItem("token");

  const menuItems = [
    { id: "dashboard", label: "Trang Chủ", icon: "📊", category: "main" },
    { id: "info", label: "Thông Tin Giám Đốc", icon: "👤", category: "main" },
    {
      id: "create-accounts",
      label: "Tạo Tài Khoản",
      icon: "➕",
      category: "manage",
    },
    {
      id: "students",
      label: "Quản Lý Học Viên",
      icon: "👥",
      category: "manage",
    },
    { id: "staff", label: "Quản Lý Nhân Viên", icon: "👨‍💼", category: "manage" },
    {
      id: "teachers",
      label: "Quản Lý Giáo Viên",
      icon: "👨‍🏫",
      category: "manage",
    },
    {
      id: "courses",
      label: "Quản Lý Khóa Học",
      icon: "📚",
      category: "manage",
    },
    { id: "reports", label: "Báo Cáo", icon: "📈", category: "reports" },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DirectorDashboardHome director={director} />;
      case "info":
        return <DirectorInfo director={director} />;
      case "create-accounts":
        return <CreateAccounts token={token} />;
      case "students":
        return <StudentManagement />;
      case "staff":
        return <StaffManagement />;
      case "teachers":
        return <TeacherManagement />;
      case "courses":
        return <CourseManagement />;
      case "reports":
        return <Reports />;
      default:
        return <DirectorDashboardHome director={director} />;
    }
  };

  return (
    <div className="director-dashboard">
      <div className="director-sidebar">
        <div className="director-profile-section">
          <div className="director-avatar">👔</div>
          <div className="director-profile-info">
            <h3>Trang Cá Nhân</h3>
            <p>{director?.fullName}</p>
            <span className="director-id">Giám Đốc</span>
          </div>
        </div>

        <nav className="director-menu">
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
            <h4 className="menu-title">QUẢN LÝ HỆ THỐNG</h4>
            {menuItems
              .filter((item) => item.category === "manage")
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
            <h4 className="menu-title">BÁO CÁO</h4>
            {menuItems
              .filter((item) => item.category === "reports")
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

        <button className="director-logout-btn" onClick={onLogout}>
          ❌ Đăng xuất
        </button>
      </div>

      <div className="director-main-content">{renderContent()}</div>
    </div>
  );
}

function DirectorDashboardHome({ director }) {
  return (
    <div className="director-home-container">
      <h2>📊 Bảng Điều Khiển Giám Đốc</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Tổng Học Viên</p>
          <p className="stat-value">150</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Doanh Thu</p>
          <p className="stat-value">500M</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Giáo Viên</p>
          <p className="stat-value">12</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Nhân Viên</p>
          <p className="stat-value">8</p>
        </div>
      </div>
    </div>
  );
}

function DirectorInfo({ director }) {
  return (
    <div className="director-info-container">
      <h2>👔 Thông Tin Giám Đốc</h2>
      <div className="info-card">
        <p>
          <strong>Họ và Tên:</strong> {director?.fullName}
        </p>
        <p>
          <strong>Email:</strong> {director?.email}
        </p>
        <p>
          <strong>Chức Vụ:</strong> Giám Đốc
        </p>
      </div>
    </div>
  );
}

function CreateAccounts({ token }) {
  const [activeTab, setActiveTab] = useState("student");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    department: "",
    position: "",
    qualifications: "",
    specialization: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      let endpoint = "";
      const payload = { ...formData };

      if (activeTab === "student") {
        endpoint = "/api/auth/create-student";
      } else if (activeTab === "staff") {
        endpoint = "/api/auth/create-staff";
      } else if (activeTab === "teacher") {
        endpoint = "/api/auth/create-teacher";
        payload.qualifications = payload.qualifications
          ? payload.qualifications.split(",")
          : [];
        payload.specialization = payload.specialization
          ? payload.specialization.split(",")
          : [];
      }

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          gender: "",
          dateOfBirth: "",
          address: "",
          department: "",
          position: "",
          qualifications: "",
          specialization: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-accounts-container">
      <h2>➕ Tạo Tài Khoản</h2>

      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === "student" ? "active" : ""}`}
          onClick={() => setActiveTab("student")}
        >
          👨‍🎓 Học Viên
        </button>
        <button
          className={`tab-btn ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          👨‍💼 Nhân Viên
        </button>
        <button
          className={`tab-btn ${activeTab === "teacher" ? "active" : ""}`}
          onClick={() => setActiveTab("teacher")}
        >
          👨‍🏫 Giáo Viên
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-row">
          <div className="form-group">
            <label>Họ và Tên *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Số Điện Thoại *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật Khẩu *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ngày Sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Giới Tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full">
            <label>Địa Chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {activeTab === "staff" && (
          <div className="form-row">
            <div className="form-group">
              <label>Phòng Ban *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Chọn phòng ban</option>
                <option value="Học vụ">Học vụ</option>
                <option value="Kế toán">Kế toán</option>
                <option value="Ghi danh">Ghi danh</option>
                <option value="Quản lý">Quản lý</option>
              </select>
            </div>
            <div className="form-group">
              <label>Chức Vị</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Vd: Trưởng phòng"
              />
            </div>
          </div>
        )}

        {activeTab === "teacher" && (
          <div className="form-row">
            <div className="form-group">
              <label>Bằng Cấp</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="Vd: TOEFL, Cambridge (ngăn cách bằng dấu phẩy)"
              />
            </div>
            <div className="form-group">
              <label>Chuyên Môn</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Vd: TOEIC, IELTS (ngăn cách bằng dấu phẩy)"
              />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Đang tạo..." : "Tạo Tài Khoản"}
        </button>
      </form>
    </div>
  );
}

function StudentManagement() {
  return (
    <div className="management-container">
      <h2>👥 Quản Lý Học Viên</h2>
    </div>
  );
}

function StaffManagement() {
  return (
    <div className="management-container">
      <h2>👨‍💼 Quản Lý Nhân Viên</h2>
    </div>
  );
}

function TeacherManagement() {
  return (
    <div className="management-container">
      <h2>👨‍🏫 Quản Lý Giáo Viên</h2>
    </div>
  );
}

function CourseManagement() {
  return (
    <div className="management-container">
      <h2>📚 Quản Lý Khóa Học</h2>
    </div>
  );
}

function Reports() {
  return (
    <div className="management-container">
      <h2>📈 Báo Cáo</h2>
    </div>
  );
}

export default DirectorDashboard;
