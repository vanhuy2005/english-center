import React from "react";

function TeacherClasses() {
  const classes = [
    {
      id: 1,
      className: "TOEIC-001",
      course: "TOEIC 600+",
      students: 15,
      schedule: "T2, T4, T6 - 19:00",
      room: "Phòng 101",
      status: "Đang diễn ra",
    },
    {
      id: 2,
      className: "IELTS-002",
      course: "IELTS 6.5",
      students: 12,
      schedule: "T3, T5 - 20:00",
      room: "Phòng 205",
      status: "Đang diễn ra",
    },
    {
      id: 3,
      className: "ENG-003",
      course: "Conversational English",
      students: 18,
      schedule: "T2, T4, T6 - 10:00",
      room: "Phòng 301",
      status: "Đang diễn ra",
    },
  ];

  return (
    <div className="teacher-classes-container">
      <h2>📚 Lớp Học</h2>

      <div className="classes-grid">
        {classes.map((cls) => (
          <div key={cls.id} className="class-card">
            <div className="class-card-header">
              <h3>{cls.className}</h3>
              <span className="class-status">{cls.status}</span>
            </div>

            <div className="class-card-body">
              <div className="class-info">
                <p>
                  <strong>Khóa Học:</strong> {cls.course}
                </p>
                <p>
                  <strong>Số Học Viên:</strong> {cls.students}
                </p>
                <p>
                  <strong>Lịch Học:</strong> {cls.schedule}
                </p>
                <p>
                  <strong>Phòng Học:</strong> {cls.room}
                </p>
              </div>

              <div className="class-actions">
                <button className="action-btn">Xem Chi Tiết</button>
                <button className="action-btn">Điểm Danh</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherClasses;
