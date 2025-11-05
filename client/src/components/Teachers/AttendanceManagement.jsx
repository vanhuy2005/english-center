import React, { useState } from "react";

function AttendanceManagement() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const classes = ["TOEIC-001", "IELTS-002", "ENG-003"];

  const students = [
    { id: 1, studentId: "HV001", fullName: "Nguyễn Văn A", status: "Có mặt" },
    { id: 2, studentId: "HV002", fullName: "Trần Thị B", status: "Vắng" },
    { id: 3, studentId: "HV003", fullName: "Lê Văn C", status: "Có mặt" },
  ];

  return (
    <div className="attendance-container">
      <h2>✓ Điểm Danh</h2>

      <div className="attendance-form">
        <div className="form-group">
          <label>Chọn Lớp</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Chọn lớp --</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Ngày Điểm Danh</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <button className="submit-btn">Tải Danh Sách</button>
      </div>

      {selectedClass && (
        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Mã Học Viên</th>
                <th>Họ và Tên</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.fullName}</td>
                  <td>
                    <select defaultValue={student.status}>
                      <option>Có mặt</option>
                      <option>Vắng</option>
                      <option>Vắng có phép</option>
                    </select>
                  </td>
                  <td>
                    <button className="action-btn">Lưu</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="save-all-btn">Lưu Tất Cả</button>
        </div>
      )}
    </div>
  );
}

export default AttendanceManagement;
