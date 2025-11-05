import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ScheduleTable.css";

function ScheduleTable() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupByRoom, setGroupByRoom] = useState(true);
  const [selectedWeekStart, setSelectedWeekStart] = useState(
    getSunday(new Date())
  );

  useEffect(() => {
    fetchSchedules();
  }, []);

  function getSunday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function getWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/schedules");
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setSchedules(getMockSchedules());
    } finally {
      setLoading(false);
    }
  };

  const getMockSchedules = () => {
    return [
      {
        _id: 1,
        room: "B.116",
        dayOfWeek: 6,
        dayName: "Thứ 6",
        date: new Date(2025, 0, 10).toISOString(),
        startTime: "12:30",
        endTime: "16:00",
        courseName: "Trí tuệ nhân tạo",
        course: "COMP1314",
        semester: "Buổi chiều",
        credits: 4,
        teacher: "Võ Hoàng Quân",
      },
      {
        _id: 2,
        room: "B.305",
        dayOfWeek: 2,
        dayName: "Thứ 2",
        date: new Date(2025, 0, 6).toISOString(),
        startTime: "09:00",
        endTime: "11:40",
        courseName: "Nhập môn công nghệ phần mềm",
        course: "COMP1044",
        semester: "Buổi sáng",
        credits: 2,
        teacher: "Trần Sơn Hải",
      },
      {
        _id: 3,
        room: "C.503",
        dayOfWeek: 5,
        dayName: "Thứ 5",
        date: new Date(2025, 0, 9).toISOString(),
        startTime: "07:20",
        endTime: "10:50",
        courseName: "Phân tích thiết kế hướng đối tượng",
        course: "COMP1060",
        semester: "Buổi sáng",
        credits: 3,
        teacher: "Võ Hoàng Quân",
      },
      {
        _id: 4,
        room: "B.116",
        dayOfWeek: 2,
        dayName: "Thứ 2",
        date: new Date(2025, 0, 6).toISOString(),
        startTime: "14:00",
        endTime: "16:30",
        courseName: "Lập trình Web",
        course: "COMP1080",
        semester: "Buổi chiều",
        credits: 3,
        teacher: "Nguyễn Minh Trí",
      },
    ];
  };

  const getDayOfWeekColor = (dayIndex) => {
    const colors = [
      "#E0F2F1",
      "#E3F2FD",
      "#F3E5F5",
      "#E8F5E9",
      "#FFF3E0",
      "#FCE4EC",
      "#F1F8E9",
    ];
    return colors[dayIndex] || "#F5F5F5";
  };

  const weekDates = getWeekDates(selectedWeekStart);
  const daysOfWeek = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getSchedulesByDay = (date) => {
    return schedules
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return isSameDay(scheduleDate, date);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const groupByRoomAndDay = () => {
    const grouped = {};
    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      const isInWeek = weekDates.some((d) => isSameDay(d, scheduleDate));

      if (isInWeek) {
        const key = schedule.room;
        if (!grouped[key]) grouped[key] = {};
        const dateStr = scheduleDate.toLocaleDateString("vi-VN");
        if (!grouped[key][dateStr]) grouped[key][dateStr] = [];
        grouped[key][dateStr].push(schedule);
      }
    });
    return grouped;
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeekStart(newDate);
  };

  const handleToday = () => {
    setSelectedWeekStart(getSunday(new Date()));
  };

  if (loading) {
    return <div className="loading">Đang tải lịch học...</div>;
  }

  const weekEndDate = new Date(
    selectedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="schedule-table-container">
      <h2>📅 Lịch Học Theo Tuần</h2>

      <div className="week-controls">
        <button onClick={handlePreviousWeek} className="nav-btn">
          {" "}
          ← Tuần Trước
        </button>

        <div className="week-info">
          <p>
            Tuần:{" "}
            <strong>
              {selectedWeekStart.toLocaleDateString("vi-VN")} -{" "}
              {weekEndDate.toLocaleDateString("vi-VN")}
            </strong>
          </p>
        </div>

        <button onClick={handleToday} className="today-btn">
          📅 Hôm Nay
        </button>
        <button onClick={handleNextWeek} className="nav-btn">
          Tuần Sau →
        </button>
      </div>

      <div className="view-toggle">
        <button
          className={groupByRoom ? "active" : ""}
          onClick={() => setGroupByRoom(true)}
        >
          📍 Theo Phòng Học
        </button>
        <button
          className={!groupByRoom ? "active" : ""}
          onClick={() => setGroupByRoom(false)}
        >
          📋 Theo Ngày
        </button>
      </div>

      {groupByRoom ? (
        <div className="by-room-view">
          {Object.entries(groupByRoomAndDay()).map(([room, days]) => (
            <div key={room} className="room-section">
              <h3>🚪 Phòng {room}</h3>
              <div className="table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Phòng</th>
                      {weekDates.map((date, index) => (
                        <th
                          key={index}
                          style={{ backgroundColor: getDayOfWeekColor(index) }}
                        >
                          {daysOfWeek[index]}
                          <br />
                          <small>{date.toLocaleDateString("vi-VN")}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="room-cell">{room}</td>
                      {weekDates.map((date, dayIndex) => {
                        const dateStr = date.toLocaleDateString("vi-VN");
                        const daySchedules = days[dateStr] || [];
                        return (
                          <td
                            key={dayIndex}
                            className="day-cell"
                            style={{
                              backgroundColor: getDayOfWeekColor(dayIndex),
                            }}
                          >
                            {daySchedules.map((schedule) => (
                              <div
                                key={schedule._id}
                                className="schedule-event"
                              >
                                <div className="event-title">
                                  {schedule.courseName}
                                </div>
                                <div className="event-code">
                                  ({schedule.course})
                                </div>
                                <div className="event-info">
                                  <div>Buổi: {schedule.semester}</div>
                                  <div>
                                    Giờ: {schedule.startTime}-{schedule.endTime}
                                  </div>
                                  <div>Nhóm: {schedule.credits}</div>
                                  <div className="event-room">
                                    Phòng: {room} (ADV)
                                  </div>
                                  <div className="event-teacher">
                                    GV: {schedule.teacher}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="by-day-view">
          {weekDates.map((date, dayIndex) => {
            const daySchedules = getSchedulesByDay(date);
            return (
              <div key={dayIndex} className="day-section">
                <h3
                  style={{
                    backgroundColor: getDayOfWeekColor(dayIndex),
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                  }}
                >
                  {daysOfWeek[dayIndex]} - {date.toLocaleDateString("vi-VN")}
                </h3>

                {daySchedules.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>Thời gian</th>
                          <th>Phòng</th>
                          <th>Khóa học</th>
                          <th>Mã khóa</th>
                          <th>Buổi</th>
                          <th>Giảng viên</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daySchedules.map((schedule, index) => (
                          <tr key={index}>
                            <td className="time-cell">
                              {schedule.startTime} - {schedule.endTime}
                            </td>
                            <td className="room-name">{schedule.room}</td>
                            <td className="course-name">
                              {schedule.courseName}
                            </td>
                            <td>{schedule.course}</td>
                            <td>{schedule.semester}</td>
                            <td>{schedule.teacher}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-schedule">Không có lịch học hôm nay</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScheduleTable;
