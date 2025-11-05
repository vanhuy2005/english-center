import React from "react";
import "./LoginRole.css";

function LoginRole({ onSelectRole }) {
  return (
    <div className="login-role-container">
      <div className="role-selection">
        <h1>🎓 Hệ Thống Quản Lý Trung Tâm Anh Ngữ</h1>
        <p>Vui lòng chọn vai trò của bạn để đăng nhập</p>

        <div className="role-cards">
          <div
            className="role-card student"
            onClick={() => onSelectRole("student")}
          >
            <div className="role-icon">👨‍🎓</div>
            <h3>Học Viên</h3>
            <p>Xem tiến độ, đăng ký khóa học, xin nghỉ</p>
            <p className="info-text">💡 Đăng ký tài khoản hoặc đăng nhập</p>
            <button>Tiếp Tục</button>
          </div>

          <div
            className="role-card staff"
            onClick={() => onSelectRole("staff")}
          >
            <div className="role-icon">👨‍💼</div>
            <h3>Nhân Viên</h3>
            <p>Quản lý học viên, tài chính, ghi danh</p>
            <p className="info-text">
              ✅ Đăng nhập (tài khoản do Giám đốc tạo)
            </p>
            <button>Đăng Nhập</button>
          </div>

          <div
            className="role-card teacher"
            onClick={() => onSelectRole("teacher")}
          >
            <div className="role-icon">👨‍🏫</div>
            <h3>Giáo Viên</h3>
            <p>Quản lý lớp học, điểm danh, kết quả</p>
            <p className="info-text">
              ✅ Đăng nhập (tài khoản do Giám đốc tạo)
            </p>
            <button>Đăng Nhập</button>
          </div>

          <div
            className="role-card director"
            onClick={() => onSelectRole("director")}
          >
            <div className="role-icon">👔</div>
            <h3>Giám Đốc</h3>
            <p>Xem báo cáo, thống kê, quản lý hệ thống</p>
            <p className="info-text">✅ Có thể đăng ký và đăng nhập</p>
            <button>Tiếp Tục</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginRole;
