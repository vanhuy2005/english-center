import React, { useState, useEffect } from "react";

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    // Fetch dữ liệu học viên
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    // Gọi API để lấy thông tin học viên
    try {
      // const response = await fetch('/api/students/me');
      // const data = await response.json();
      // setStudents(data);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  return (
    <div className="student-management">
      <h2>Thông tin học viên</h2>
      <div className="student-info">
        <p>Mã học viên: HV001</p>
        <p>Tên: Nguyễn Văn A</p>
        <p>Email: student@example.com</p>
        <p>Trạng thái: Đang học</p>
      </div>

      <h3>Các khóa học của bạn</h3>
      <table>
        <thead>
          <tr>
            <th>Khóa học</th>
            <th>Giảng viên</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>TOEIC 600</td>
            <td>Thầy John</td>
            <td>T2, T4, T6</td>
            <td>Đang học</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default StudentManagement;
