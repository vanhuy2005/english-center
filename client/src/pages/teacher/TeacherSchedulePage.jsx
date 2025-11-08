import React, { useState, useEffect } from "react";
import { Card, Loading, Badge } from "@components/common";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import api from "@services/api";
import { toast } from "react-hot-toast";

/**
 * Teacher Schedule Page - View teaching schedule
 */
const TeacherSchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [view, setView] = useState("week"); // week or month

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, view]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/teachers/schedule", {
        params: {
          date: selectedDate,
          view: view,
        },
      });
      setSchedule(response.data?.data?.schedule || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Không thể tải lịch dạy");
    } finally {
      setLoading(false);
    }
  };

  const getSessionColor = (time) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour < 12) return "bg-blue-100 border-blue-300 text-blue-800";
    if (hour < 17) return "bg-green-100 border-green-300 text-green-800";
    return "bg-purple-100 border-purple-300 text-purple-800";
  };

  const groupScheduleByDate = () => {
    const grouped = {};
    schedule.forEach((session) => {
      const date = new Date(session.date).toLocaleDateString("vi-VN");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const groupedSchedule = groupScheduleByDate();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Lịch Dạy
          </h1>
          <p className="text-gray-600 mt-1">Xem lịch giảng dạy của bạn</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setView("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() =>
              setSelectedDate(new Date().toISOString().split("T")[0])
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hôm nay
          </button>
        </div>
      </Card>

      {/* Schedule Display */}
      {Object.keys(groupedSchedule).length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            Không có lịch dạy trong khoảng thời gian này
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSchedule).map(([date, sessions]) => (
            <div key={date}>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {date}
                <Badge variant="info">{sessions.length} buổi</Badge>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <Card
                    key={session._id}
                    className={`p-4 border-l-4 ${getSessionColor(
                      session.startTime
                    )}`}
                  >
                    <div className="space-y-3">
                      {/* Class Name */}
                      <h3 className="font-bold text-lg text-gray-900">
                        {session.class?.name}
                      </h3>

                      {/* Time */}
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {session.startTime} - {session.endTime}
                        </span>
                      </div>

                      {/* Room */}
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Phòng: {session.room || "Chưa xếp"}</span>
                      </div>

                      {/* Students */}
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          {session.class?.students?.length || 0} học viên
                        </span>
                      </div>

                      {/* Status */}
                      {session.status && (
                        <Badge
                          variant={
                            session.status === "completed"
                              ? "success"
                              : session.status === "cancelled"
                              ? "danger"
                              : "info"
                          }
                        >
                          {session.status === "completed"
                            ? "Đã hoàn thành"
                            : session.status === "cancelled"
                            ? "Đã hủy"
                            : "Sắp diễn ra"}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
        <h3 className="font-bold text-lg text-gray-900 mb-4">
          Thống kê tuần này
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tổng số buổi</p>
            <p className="text-2xl font-bold text-blue-600">
              {schedule.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Đã hoàn thành</p>
            <p className="text-2xl font-bold text-green-600">
              {schedule.filter((s) => s.status === "completed").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sắp tới</p>
            <p className="text-2xl font-bold text-purple-600">
              {
                schedule.filter(
                  (s) =>
                    !s.status ||
                    (s.status !== "completed" && s.status !== "cancelled")
                ).length
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeacherSchedulePage;
