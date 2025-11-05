import React, { useState } from "react";

function TeacherManagement() {
  const [classes, setClasses] = useState([]);

  return (
    <div className="teacher-management">
      <h2>Quản lý lớp học - Giảng viên</h2>

      <div className="teacher-profile">
        <h3>Thông tin giảng viên</h3>
        <p>Tên: John Smith</p>
        <p>Email: john@englishcenter.com</p>
        <p>Chuyên môn: TOEIC, IELTS</p>
      </div>

      <div className="classes-section">
        <h3>Các lớp dạy</h3>
        <table>
          <thead>
            <tr>
              <th>Lớp</th>
              <th>Khóa học</th>
              <th>Số học viên</th>
              <th>Lịch học</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TOEIC-001</td>
              <td>TOEIC 600+</td>
              <td>15</td>
              <td>T2, T4, T6 - 19:00</td>
              <td>
                <button>Xem chi tiết</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="attendance-section">
        <h3>Điểm danh</h3>
        <form>
          <select>
            <option>Chọn lớp</option>
          </select>
          <input type="date" />
          <button type="submit">Tải điểm danh</button>
        </form>
      </div>
    </div>
  );
}

export default TeacherManagement;
