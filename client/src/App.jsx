import React, { useState, useEffect } from "react";
import axios from "axios";
import LoginRole from "./components/Auth/LoginRole";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import StudentDashboard from "./components/Students/StudentDashboard";
import TeacherDashboard from "./components/Teachers/TeacherDashboard";
import StaffDashboard from "./components/Staff/StaffDashboard";
import DirectorDashboard from "./components/Director/DirectorDashboard";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("role");
  const [currentRole, setCurrentRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    if (token && user && role) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const handleSelectRole = (role) => {
    setCurrentRole(role);
    // Chỉ học viên và giám đốc được đăng ký
    // Nhân viên và giáo viên chỉ đăng nhập
    if (role === "student" || role === "director") {
      setCurrentPage("login-register");
    } else {
      // Nhân viên và giáo viên chỉ đăng nhập
      setCurrentPage("login");
    }
  };

  const handleLoginSuccess = (user, role, token) => {
    setCurrentUser(user);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRole(null);
    setCurrentPage("role");
    setCurrentRole(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (isAuthenticated && userRole) {
    switch (userRole) {
      case "student":
        return (
          <StudentDashboard student={currentUser} onLogout={handleLogout} />
        );
      case "teacher":
        return (
          <TeacherDashboard teacher={currentUser} onLogout={handleLogout} />
        );
      case "staff":
        return <StaffDashboard staff={currentUser} onLogout={handleLogout} />;
      case "director":
        return (
          <DirectorDashboard director={currentUser} onLogout={handleLogout} />
        );
      default:
        return <LoginRole onSelectRole={handleSelectRole} />;
    }
  }

  if (currentPage === "role") {
    return <LoginRole onSelectRole={handleSelectRole} />;
  }

  if (currentPage === "login-register") {
    return (
      <div>
        <Login
          role={currentRole}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentPage("register")}
          onSwitchToRole={() => setCurrentPage("role")}
        />
        <div className="auth-switch-container">
          <button onClick={() => setCurrentPage("register")}>
            Chưa có tài khoản? Đăng ký ngay
          </button>
        </div>
      </div>
    );
  }

  if (currentPage === "login") {
    return (
      <Login
        role={currentRole}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRole={() => setCurrentPage("role")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <Register
        role={currentRole}
        onRegisterSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setCurrentPage("login-register")}
      />
    );
  }

  return <LoginRole onSelectRole={handleSelectRole} />;
}

export default App;
