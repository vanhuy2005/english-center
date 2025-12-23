import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Loader,
  ArrowLeft,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Card, Badge, Loading } from "@components/common";
import { getMyClasses } from "@services/classApi";
import { getMySchedules } from "@services/scheduleApi";
import { useAuth } from "@contexts/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const StudentTimetablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'month'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [periodSchedules, setPeriodSchedules] = useState([]);

  const daysOfWeek = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  useEffect(() => {
    loadStudentClasses();
    loadSchedulesForPeriod();
  }, []);

  const loadStudentClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📥 Loading student classes...");

      const data = await getMyClasses();
      console.log("✓ Classes loaded:", data);

      setEnrolledClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error loading student classes:", err);
      setError("Lỗi tải danh sách lớp học");
      setEnrolledClasses(getMockClasses());
    } finally {
      setLoading(false);
    }
  };

  const computePeriodRange = (mode, dateStr) => {
    // Parse date string safely as local date (expecting YYYY-MM-DD). This avoids
    // timezone shifts when using new Date(dateStr) which can produce previous day
    // in some timezones.
    let date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
      date = new Date(y, m - 1, d);
    } else {
      date = new Date(dateStr);
    }

    if (mode === "week") {
      // get Monday as start
      const day = date.getDay();
      const diffToMonday = (day + 6) % 7; // convert Sunday(0)->6, Mon(1)->0, etc.
      const monday = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - diffToMonday
      );
      const sunday = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 6
      );
      return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10),
      };
    }

    // month
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  };

  const loadSchedulesForPeriod = async (
    mode = viewMode,
    dateStr = selectedDate
  ) => {
    try {
      const { start, end } = computePeriodRange(mode, dateStr);
      const data = await getMySchedules(start, end);
      setPeriodSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading schedules for period:", err);
      setPeriodSchedules([]);
    }
  };

  const getMockClasses = () => [
    {
      _id: "class_1",
      name: "English A1 - Lớp 1",
      code: "EN-A1-01",
      course: {
        _id: "course1",
        name: "English A1",
      },
      instructor: {
        _id: "instructor1",
        fullName: "Cô Thanh",
      },
      schedule: [
        {
          dayOfWeek: "monday",
          startTime: "08:00",
          endTime: "10:00",
          classroom: "Phòng A1",
        },
        {
          dayOfWeek: "wednesday",
          startTime: "14:00",
          endTime: "16:00",
          classroom: "Phòng A1",
        },
      ],
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      studentCount: 25,
    },
  ];

  const getDayName = (dayOfWeek) => {
    const days = {
      monday: "Thứ Hai",
      tuesday: "Thứ Ba",
      wednesday: "Thứ Tư",
      thursday: "Thứ Năm",
      friday: "Thứ Sáu",
      saturday: "Thứ Bảy",
      sunday: "Chủ Nhật",
    };
    return days[dayOfWeek] || dayOfWeek;
  };

  const getSchedulesForDay = (dayOfWeek) => {
    const schedules = [];

    enrolledClasses.forEach((classItem) => {
      if (classItem.schedule && Array.isArray(classItem.schedule)) {
        const daySchedules = classItem.schedule.filter(
          (s) => s.dayOfWeek === dayOfWeek
        );
        daySchedules.forEach((schedule) => {
          schedules.push({
            ...schedule,
            className: classItem.name,
            classCode: classItem.classCode,
            classId: classItem._id,
            teacher: classItem.teacher,
            room: classItem.room,
          });
        });
      }
    });

    // Sort by start time
    return schedules.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const todaySchedules = getSchedulesForDay(selectedDay);

  if (loading) return <Loading />;

  // If no enrolled classes
  if (enrolledClasses.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thời Khóa Biểu</h1>
          <p className="text-gray-600 mt-1">
            Lịch học của {user?.profile?.fullName}
          </p>
        </div>

        {/* Empty State */}
        <Card className="p-12 text-center">
          <Calendar size={64} className="mx-auto text-gray-400 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Chưa có lớp học nào
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa đăng ký lớp học. Vui lòng liên hệ với bộ phận ghi danh để
            đăng ký lớp.
          </p>
          <p className="text-sm text-gray-500">
            Khi đăng ký lớp, lịch học sẽ tự động hiển thị ở đây.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={32} className="text-blue-600" />
                Lớp Học Của Tôi
              </h1>
              <p className="text-gray-600 mt-1">
                Xem danh sách lớp học và lịch biểu
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <select
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value);
                  loadSchedulesForPeriod(e.target.value, selectedDate);
                }}
                className="border rounded px-3 py-2"
              >
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  loadSchedulesForPeriod(viewMode, e.target.value);
                }}
                className="border rounded px-3 py-2"
              />
              <button
                onClick={() => loadSchedulesForPeriod()}
                className="bg-blue-600 text-white px-3 py-2 rounded"
              >
                Tải
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Classes List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Period overview removed — keeping timetable table below */}

        {/* Timetable table: rooms vs days */}
        <div className="overflow-auto bg-white border rounded">
          {(() => {
            const { start } = computePeriodRange(viewMode, selectedDate);
            const startDate = new Date(start);
            const days = [];
            for (let i = 0; i < 7; i++) {
              const d = new Date(startDate);
              d.setDate(startDate.getDate() + i);
              days.push(d);
            }

            // collect rooms from schedules and enrolled classes
            const roomSet = new Set();
            periodSchedules.forEach((s) => {
              const r =
                s.room ||
                s.classroom ||
                s.roomName ||
                (s.class && s.class.room);
              if (r) roomSet.add(r);
            });
            enrolledClasses.forEach((c) => {
              if (c.room) roomSet.add(c.room);
            });
            const rooms = Array.from(roomSet);
            if (rooms.length === 0) {
              return (
                <div className="p-6 text-center text-gray-500">
                  Không có thông tin phòng
                </div>
              );
            }

            const formatDateKey = (d) => d.toISOString().slice(0, 10);

            const schedulesForCell = (room, d) => {
              const key = formatDateKey(d);
              return periodSchedules.filter((s) => {
                const sRoom =
                  s.room ||
                  s.classroom ||
                  s.roomName ||
                  (s.class && s.class.room) ||
                  "";
                if (s.date) {
                  const sDate = new Date(s.date);
                  if (sDate.toISOString().slice(0, 10) !== key) return false;
                } else if (s.dayOfWeek !== undefined && s.dayOfWeek !== null) {
                  const targetWeekday = d.getDay();
                  if (typeof s.dayOfWeek === "number") {
                    if (
                      s.dayOfWeek !== targetWeekday &&
                      s.dayOfWeek % 7 !== targetWeekday
                    )
                      return false;
                  } else if (typeof s.dayOfWeek === "string") {
                    const map = {
                      sunday: 0,
                      monday: 1,
                      tuesday: 2,
                      wednesday: 3,
                      thursday: 4,
                      friday: 5,
                      saturday: 6,
                      "chủ nhật": 0,
                      "thứ hai": 1,
                      "thứ ba": 2,
                      "thứ tư": 3,
                      "thứ năm": 4,
                      "thứ sáu": 5,
                      "thứ bảy": 6,
                    };
                    const w = map[s.dayOfWeek.toLowerCase()] ?? null;
                    if (w !== targetWeekday) return false;
                  }
                } else {
                  return false;
                }
                // room match
                if (room && sRoom) return sRoom === room;
                if (!room && !sRoom) return true;
                return false;
              });
            };

            return (
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100">Phòng</th>
                    {days.map((d, i) => (
                      <th
                        key={i}
                        className="border p-2 bg-blue-700 text-white text-sm"
                      >
                        <div>
                          {d.toLocaleDateString("vi-VN", { weekday: "short" })}
                        </div>
                        <div className="text-xs">
                          {d.toLocaleDateString("vi-VN")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room, ri) => (
                    <tr key={ri} className="align-top">
                      <td className="border p-2 bg-gray-100 font-medium">
                        {room}
                      </td>
                      {days.map((d, ci) => (
                        <td key={ci} className="border p-2 align-top min-h-28">
                          <div className="space-y-2">
                            {schedulesForCell(room, d).map((s, si) => (
                              <div
                                key={si}
                                className="p-2 bg-blue-50 border border-blue-100 rounded text-center text-sm"
                              >
                                <div className="font-semibold text-blue-800">
                                  {s.course?.name || s.topic || "Buổi học"}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {s.startTime || ""}
                                  {s.startTime && s.endTime
                                    ? ` - ${s.endTime}`
                                    : ""}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {s.group ? `Nhóm: ${s.group}` : ""}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {s.teacher?.fullName || s.teacher || ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default StudentTimetablePage;
