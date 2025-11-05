import React, { useState } from "react";

function TeacherInfo({ teacher }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: teacher?.fullName || "",
    email: teacher?.email || "",
    phone: teacher?.phone || "",
    dateOfBirth: teacher?.dateOfBirth || "",
    gender: teacher?.gender || "",
    address: teacher?.address || "",
  });

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
    <div className="teacher-info-container">
      <div className="teacher-info-header">
        <h2>👤 Thông Tin Giáo Viên</h2>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Chỉnh sửa
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="info-cards-grid">
          <div className="info-card">
            <div className="card-header">
              <h3>📋 Thông Tin Giáo Viên</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Mã Giáo Viên</span>
                <span className="info-value">
                  {teacher?.teacherId || "GV001"}
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
                <span className="info-label">Chuyên Môn</span>
                <span className="info-value">TOEIC, IELTS</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h3>📞 Thông Tin Liên Lạc</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Mã Giáo Viên</span>
                <span className="info-value">
                  {teacher?.teacherId || "GV001"}
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
        </div>
      ) : (
        <div className="info-form-section">
          {/* ...existing form code... */}
        </div>
      )}

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

export default TeacherInfo;
