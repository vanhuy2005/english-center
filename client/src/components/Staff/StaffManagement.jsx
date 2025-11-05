import React, { useState } from "react";

function StaffManagement({ department }) {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({});

  const renderDepartmentContent = () => {
    switch (department) {
      case "academic":
        return (
          <div>
            <h2>Quản lý học vụ</h2>
            <div>
              <h3>Danh sách học viên</h3>
              <table>
                <thead>
                  <tr>
                    <th>Mã HV</th>
                    <th>Tên</th>
                    <th>Khóa học</th>
                    <th>Điểm</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>HV001</td>
                    <td>Nguyễn Văn A</td>
                    <td>TOEIC</td>
                    <td>7.5</td>
                    <td>Đạt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "accounting":
        return (
          <div>
            <h2>Quản lý kế toán</h2>
            <div>
              <h3>Hóa đơn và thanh toán</h3>
              <table>
                <thead>
                  <tr>
                    <th>Mã HV</th>
                    <th>Tên học viên</th>
                    <th>Khóa học</th>
                    <th>Học phí</th>
                    <th>Đã thanh toán</th>
                    <th>Còn nợ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>HV001</td>
                    <td>Nguyễn Văn A</td>
                    <td>TOEIC</td>
                    <td>5,000,000</td>
                    <td>5,000,000</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "enrollment":
        return (
          <div>
            <h2>Quản lý ghi danh</h2>
            <form>
              <h3>Thêm học viên mới</h3>
              <input type="text" placeholder="Tên học viên" />
              <input type="email" placeholder="Email" />
              <input type="tel" placeholder="Số điện thoại" />
              <select>
                <option>Chọn khóa học</option>
              </select>
              <button type="submit">Ghi danh</button>
            </form>
          </div>
        );
      default:
        return <div>Phòng ban không xác định</div>;
    }
  };

  return <div className="staff-management">{renderDepartmentContent()}</div>;
}

export default StaffManagement;
