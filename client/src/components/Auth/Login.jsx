import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

function Login({ role, onLoginSuccess, onSwitchToRegister, onSwitchToRole }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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
    setLoading(true);

    try {
      let endpoint = "";
      if (role === "student") endpoint = "/api/auth/login-student";
      else if (role === "staff") endpoint = "/api/auth/login-staff";
      else if (role === "teacher") endpoint = "/api/auth/login-teacher";
      else if (role === "director") endpoint = "/api/auth/login-director";
      else endpoint = "/api/auth/login"; // default

      console.log("Đang đăng nhập với endpoint:", endpoint);

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        formData
      );

      if (response.data.success) {
        console.log("Đăng nhập thành công:", response.data.role);
        onLoginSuccess(
          response.data.user,
          response.data.role,
          response.data.token
        );
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err.response?.data);
      setError(
        err.response?.data?.message || "Lỗi đăng nhập. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = () => {
    if (role === "student") return "Học Viên";
    if (role === "staff") return "Nhân Viên";
    if (role === "teacher") return "Giáo Viên";
    if (role === "director") return "Giám Đốc";
    return "Tài Khoản";
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <button className="back-btn" onClick={onSwitchToRole}>
          ← Quay Lại
        </button>
        <h2>Đăng Nhập {getRoleLabel()}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
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
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        {role === "student" && onSwitchToRegister && (
          <p className="auth-switch">
            Chưa có tài khoản?
            <button type="button" onClick={onSwitchToRegister}>
              Đăng ký ngay
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
