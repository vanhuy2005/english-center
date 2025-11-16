import { useState, useEffect } from "react";
import { scheduleService } from "../../services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/common";
import { Badge } from "@components/common";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // week, month

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await scheduleService.getMySchedules({
        startDate: getStartDate(),
        endDate: getEndDate(),
      });
      setSchedules(response.data || []);
    } catch (error) {
      console.error('Fetch schedules error:', error);
      // Set empty schedules instead of showing error
      setSchedules([]);
      // toast.error("Không thể tải lịch học!");
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(selectedDate);
    if (viewMode === "week") {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(date.setDate(diff));
    }
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getEndDate = () => {
    const date = new Date(selectedDate);
    if (viewMode === "week") {
      const startDate = getStartDate();
      return new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const navigateDate = (direction) => {
    const date = new Date(selectedDate);
    if (viewMode === "week") {
      date.setDate(date.getDate() + (direction === "prev" ? -7 : 7));
    } else {
      date.setMonth(date.getMonth() + (direction === "prev" ? -1 : 1));
    }
    setSelectedDate(date);
  };

  const getDaysInView = () => {
    const days = [];
    const start = getStartDate();
    const end = getEndDate();
    const current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return viewMode === "week" ? days.slice(0, 7) : days;
  };

  const getSchedulesForDay = (date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatTime = (time) => {
    return time
      ? new Date(`1970-01-01T${time}`).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch Học</h1>
          <p className="text-gray-600">Xem và quản lý lịch học của bạn</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="mb-6 border-t-4 border-t-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <CardTitle className="text-xl">
              {viewMode === "week"
                ? `Tuần ${Math.ceil(
                    (selectedDate.getDate() + 6 - selectedDate.getDay()) / 7
                  )} - Tháng ${
                    selectedDate.getMonth() + 1
                  }/${selectedDate.getFullYear()}`
                : `Tháng ${
                    selectedDate.getMonth() + 1
                  }/${selectedDate.getFullYear()}`}
            </CardTitle>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {getDaysInView().map((date, index) => {
          const daySchedules = getSchedulesForDay(date);
          const today = isToday(date);

          return (
            <Card
              key={index}
              className={`${
                today ? "border-2 border-blue-600 bg-blue-50" : ""
              } ${
                daySchedules.length > 0 ? "hover:shadow-lg" : ""
              } transition-shadow`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-center">
                  <div
                    className={`${
                      today ? "text-blue-600 font-bold" : "text-gray-900"
                    }`}
                  >
                    {date.toLocaleDateString("vi-VN", { weekday: "short" })}
                  </div>
                  <div
                    className={`text-2xl ${
                      today ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySchedules.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">
                    Không có lịch
                  </p>
                ) : (
                  daySchedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {schedule.course?.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {schedule.class?.name || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatTime(schedule.startTime)} -{" "}
                          {formatTime(schedule.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {schedule.room || "N/A"}
                        </span>
                      </div>

                      <Badge
                        className={`${getStatusColor(schedule.status)} text-xs`}
                      >
                        {schedule.status === "completed" && "Hoàn thành"}
                        {schedule.status === "ongoing" && "Đang học"}
                        {schedule.status === "cancelled" && "Đã hủy"}
                        {schedule.status === "scheduled" && "Sắp diễn ra"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SchedulePage;
