import React from "react";

function StudentNotification() {
  const notifications = [
    {
      id: 1,
      title: "Thông báo lịch học",
      date: "15/01/2024",
      content: "Lịch học của bạn sẽ thay đổi vào tuần sau",
    },
    {
      id: 2,
      title: "Kết quả bài kiểm tra",
      date: "14/01/2024",
      content: "Bài kiểm tra của bạn đã được chấm điểm",
    },
    {
      id: 3,
      title: "Nhắc nhở thanh toán",
      date: "13/01/2024",
      content: "Vui lòng thanh toán học phí còn nợ",
    },
  ];

  return (
    <div className="notification-container">
      <h2>Thông báo</h2>
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

export default StudentNotification;
