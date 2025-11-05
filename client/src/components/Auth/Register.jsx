import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

function Register({ role, onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Chỉ cho phép học viên và giám đốc đăng ký
  if (role !== "student" && role !== "director") {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>⛔ Không Có Quyền Đăng Ký</h2>
          <p>Chỉ Học Viên và Giám Đốc được đăng ký tài khoản.</p>
          <p>Nhân viên và Giáo viên sẽ được Giám Đốc tạo tài khoản.</p>
          <button onClick={onSwitchToLogin} className="back-button">
            ← Quay Lại
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Vui lòng điền tất cả các trường bắt buộc");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không trùng khớp");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const endpoint =
        role === "director"
          ? "/api/auth/register-director"
          : "/api/auth/register";
      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        formData
      );

      if (response.data.success) {
        onRegisterSuccess(
          response.data.user,
          response.data.role,
          response.data.token
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () =>
    role === "director" ? "Đăng Ký Giám Đốc" : "Đăng Ký Học Viên";

  return (
    <div className="auth-container">
      <div className="auth-form">
        <button className="back-btn" onClick={onSwitchToLogin}>
          ← Quay Lại
        </button>
        <h2>{getTitle()}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên"
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
              placeholder="Nhập email"
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
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

          <div className="form-group">
            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng Ký"}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản?
          <button type="button" onClick={onSwitchToLogin}>
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
