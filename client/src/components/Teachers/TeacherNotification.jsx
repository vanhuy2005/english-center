import React from "react";

function TeacherNotification() {
  const notifications = [
    {
      id: 1,
      title: "Lịch Dạy Mới",
      date: "15/01/2025",
      content: "Bạn có lớp mới được thêm vào lịch dạy",
    },
    {
      id: 2,
      title: "Cập Nhật Học Viên",
      date: "14/01/2025",
      content: "Có học viên mới đăng ký lớp của bạn",
    },
    {
      id: 3,
      title: "Nhắc Nhở Điểm Danh",
      date: "13/01/2025",
      content: "Vui lòng điểm danh cho lớp hôm nay",
    },
  ];

  return (
    <div className="notification-container">
      <h2>📢 Thông Báo</h2>

      <div className="notification-list">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification-item">
            <div className="notif-date">{notif.date}</div>
            <div className="notif-content">
              <h4>{notif.title}</h4>
              <p>{notif.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherNotification;
