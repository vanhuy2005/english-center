import React, { useState, useEffect } from "react";
import "./ScheduleCalendar.css";

function ScheduleCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const scheduleData = [
      {
        id: 1,
        title: "TOEIC 600+ - Phòng 101",
        start: new Date(2025, 0, 6, 19, 0),
        end: new Date(2025, 0, 6, 21, 0),
        resource: {
          course: "TOEIC 600+",
          room: "Phòng 101",
          teacher: "Thầy John Smith",
        },
      },
      {
        id: 2,
        title: "TOEIC 600+ - Phòng 101",
        start: new Date(2025, 0, 8, 19, 0),
        end: new Date(2025, 0, 8, 21, 0),
        resource: {
          course: "TOEIC 600+",
          room: "Phòng 101",
          teacher: "Thầy John Smith",
        },
      },
      {
        id: 3,
        title: "TOEIC 600+ - Phòng 101",
        start: new Date(2025, 0, 10, 19, 0),
        end: new Date(2025, 0, 10, 21, 0),
        resource: {
          course: "TOEIC 600+",
          room: "Phòng 101",
          teacher: "Thầy John Smith",
        },
      },
      {
        id: 4,
        title: "IELTS 6.5 - Phòng 205",
        start: new Date(2025, 0, 11, 14, 0),
        end: new Date(2025, 0, 11, 16, 0),
        resource: {
          course: "IELTS 6.5",
          room: "Phòng 205",
          teacher: "Cô Sarah Johnson",
        },
      },
    ];

    setEvents(scheduleData);
  }, []);

  const handleSelectEvent = (event) => {
    alert(`
      Khóa học: ${event.resource.course}
      Phòng: ${event.resource.room}
      Giảng viên: ${event.resource.teacher}
      Thời gian: ${event.start.getHours()}:${String(
      event.start.getMinutes()
    ).padStart(2, "0")} - ${event.end.getHours()}:${String(
      event.end.getMinutes()
    ).padStart(2, "0")}
    `);
  };

  return (
    <div className="schedule-calendar-container">
      <h2>📅 Lịch Học (Calendar View)</h2>

      <div className="simple-calendar">
        <table className="calendar-table">
          <thead>
            <tr>
              <th>Sự Kiện</th>
              <th>Ngày Giờ</th>
              <th>Phòng</th>
              <th>Giảng Viên</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.resource.course}</td>
                <td>
                  {event.start.toLocaleDateString("vi-VN")}{" "}
                  {event.start.getHours()}:
                  {String(event.start.getMinutes()).padStart(2, "0")}
                </td>
                <td>{event.resource.room}</td>
                <td>{event.resource.teacher}</td>
                <td>
                  <button onClick={() => handleSelectEvent(event)}>
                    Xem Chi Tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ScheduleCalendar;
