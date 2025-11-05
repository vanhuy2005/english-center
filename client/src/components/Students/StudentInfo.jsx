import React, { useState, useEffect } from "react";
import "./StudentInfo.css";

function StudentInfo({ student }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: student?.fullName || "",
    email: student?.email || "",
    phone: student?.phone || "",
    dateOfBirth: student?.dateOfBirth || "",
    gender: student?.gender || "",
    address: student?.address || "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.studentId || "48.01.004.055",
        fullName: student.fullName || "Nguyễn Văn Quang Huy",
        dateOfBirth: student.dateOfBirth || "20/10/2005",
        gender: student.gender || "Nam",
        program: "6 tháng",
        phone: student.phone || "",
        email: student.email || "",
        address: student.address || "",
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    alert("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  return (
    <div className="student-info-container">
      <div className="student-info-header">
        <h2>🔐 Thông tin cá nhân</h2>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Chỉnh sửa
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="info-cards-grid">
          {/* Thông Tin Học Viên */}
          <div className="info-card">
            <div className="card-header">
              <h3>📋 Thông Tin Học Viên</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Mã Học Viên</span>
                <span className="info-value">
                  {student?.studentId || "HV0001"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Họ và Tên</span>
                <span className="info-value">{formData.fullName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Ngày Sinh</span>
                <span className="info-value">
                  {formData.dateOfBirth || "Chưa cập nhật"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Giới Tính</span>
                <span className="info-value">
                  {formData.gender || "Chưa cập nhật"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Khóa Học</span>
                <span className="info-value">6 tháng</span>
              </div>
            </div>
          </div>

          {/* Thông Tin Liên Lạc */}
          <div className="info-card">
            <div className="card-header">
              <h3>📞 Thông Tin Liên Lạc</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Mã Học Viên</span>
                <span className="info-value">
                  {student?.studentId || "HV0001"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Họ và Tên</span>
                <span className="info-value">{formData.fullName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{formData.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Số Điện Thoại</span>
                <span className="info-value">
                  {formData.phone || "Chưa cập nhật"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Địa Chỉ</span>
                <span className="info-value">
                  {formData.address || "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </div>

          {/* Thông Tin Người Liên Hệ */}
          <div className="info-card">
            <div className="card-header">
              <h3>👥 Thông Tin Người Liên Hệ</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Mã Học Viên</span>
                <span className="info-value">
                  {student?.studentId || "HV0001"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Họ và Tên</span>
                <span className="info-value">{formData.fullName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Ngày Sinh</span>
                <span className="info-value">
                  {formData.dateOfBirth || "Chưa cập nhật"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Giới Tính</span>
                <span className="info-value">
                  {formData.gender || "Chưa cập nhật"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Khóa Học</span>
                <span className="info-value">6 tháng</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="info-form-section">
          <form className="info-form">
            <div className="form-row">
              <div className="form-group">
                <label>Họ và Tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số Điện Thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Ngày Sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
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
              <div className="form-group">
                <label>Địa Chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="button" className="save-btn" onClick={handleSave}>
                💾 Lưu
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Update Button */}
      {!isEditing && (
        <div className="update-section">
          <button className="update-info-btn">
            Cập nhật thông tin cá nhân
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentInfo;
