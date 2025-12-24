import React, { useState, useEffect } from "react";
import { Card, Button, Loading, Badge } from "@components/common";
import { scheduleService } from "@services";
import { getMyClasses } from "../../services/student";
import toast from "react-hot-toast";
import { useAuth, useLanguage } from "@hooks";

/**
 * ScheduleCalendarPage - Calendar view for schedules
 */
const ScheduleCalendarPage = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [view, setView] = useState("week"); // 'week' or 'day'

  useEffect(() => {
    fetchSchedules();
  }, [currentDate, view]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      if (role === 'student') {
        const classes = await getMyClasses();
        const generatedSchedules = [];
        
        // Calculate start of the week (Monday)
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay() || 7; // 1=Mon, ..., 7=Sun
        startOfWeek.setDate(startOfWeek.getDate() - day + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        // Generate schedules for the displayed week
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            // Map JS getDay() (0=Sun, 1=Mon) to DB dayOfWeek (2=Mon, ..., 8=Sun)
            const jsDay = date.getDay();
            const dbDayOfWeek = jsDay === 0 ? 8 : jsDay + 1;

            classes.forEach(cls => {
                if (cls.schedule && Array.isArray(cls.schedule)) {
                    cls.schedule.forEach(sch => {
                        if (sch.dayOfWeek === dbDayOfWeek) {
                            generatedSchedules.push({
                                _id: `${cls._id}-${date.getTime()}`,
                                date: date.toISOString(),
                                dayOfWeek: date.toLocaleDateString("vi-VN", { weekday: "long" }),
                                startTime: sch.startTime,
                                endTime: sch.endTime,
                                class: {
                                    _id: cls._id,
                                    className: cls.name,
                                    classCode: cls.classCode
                                },
                                room: sch.room || cls.room,
                                status: cls.status === 'ongoing' ? 'scheduled' : cls.status
                            });
                        }
                    });
                }
            });
        }
        setSchedules(generatedSchedules);
      } else {
        // Mock data for other roles for now
        const mockSchedules = generateMockSchedules();
        setSchedules(mockSchedules);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Không thể tải lịch học");
    } finally {
      setLoading(false);
    }
  };

  const generateMockSchedules = () => {
    const today = new Date();
    const schedules = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Add 2-3 random schedules per day
      const schedulesPerDay = Math.floor(Math.random() * 2) + 1;

      for (let j = 0; j < schedulesPerDay; j++) {
        schedules.push({
          _id: `${i}-${j}`,
          date: date.toISOString(),
          dayOfWeek: date.toLocaleDateString("vi-VN", { weekday: "long" }),
          startTime: j === 0 ? "08:00" : j === 1 ? "14:00" : "18:00",
          endTime: j === 0 ? "10:00" : j === 1 ? "16:00" : "20:00",
          class: {
            _id: `class-${j}`,
            className: ["English Basic A1", "IELTS 6.5", "TOEIC 800"][j % 3],
            classCode: ["EB-A1-001", "IELTS-65-002", "TOEIC-800-003"][j % 3],
          },
          room: `Room ${101 + j}`,
          status: "scheduled",
        });
      }
    }

    return schedules;
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getSchedulesForDate = (date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const weekDays = getWeekDays();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch học</h1>
          <p className="text-gray-600">
            {currentDate.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            ← Tuần trước
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hôm nay
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            Tuần sau →
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span>Đã lên lịch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success rounded"></div>
            <span>Đã hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-danger rounded"></div>
            <span>Đã hủy</span>
          </div>
        </div>
      </Card>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const daySchedules = getSchedulesForDate(day);
          const isCurrentDay = isToday(day);

          return (
            <Card
              key={index}
              className={`${
                isCurrentDay
                  ? "border-2 border-primary bg-primary bg-opacity-5"
                  : ""
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-sm text-gray-600">
                  {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isCurrentDay ? "text-primary" : "text-gray-900"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-2">
                {daySchedules.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-4">
                    Không có lịch
                  </div>
                ) : (
                  daySchedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="p-2 bg-primary bg-opacity-10 rounded-lg cursor-pointer hover:bg-opacity-20 transition-colors"
                    >
                      <div className="text-xs font-semibold text-primary mb-1">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {schedule.class.className}
                      </div>
                      <div className="text-xs text-gray-600">
                        {schedule.room}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Today's Schedule Detail */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Lịch học hôm nay</h3>
        {getSchedulesForDate(new Date()).length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Không có lịch học hôm nay
          </div>
        ) : (
          <div className="space-y-3">
            {getSchedulesForDate(new Date()).map((schedule) => (
              <div
                key={schedule._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Thời gian</div>
                    <div className="text-lg font-bold text-primary">
                      {schedule.startTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      {schedule.endTime}
                    </div>
                  </div>
                  <div className="border-l border-gray-300 pl-4">
                    <div className="font-semibold text-gray-900">
                      {schedule.class.className}
                    </div>
                    <div className="text-sm text-gray-600">
                      {schedule.class.classCode} • {schedule.room}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {role === "teacher" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/attendance/mark/${schedule.class._id}`)
                        }
                      >
                        Điểm danh
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          (window.location.href = `/classes/${schedule.class._id}`)
                        }
                      >
                        Chi tiết
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {/* Floating action button for academic staff to manage schedules */}
      {role === "academic" && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/academic/schedule")}
            className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg"
          >
            + Quản Lý Lịch
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendarPage;
