import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getMySchedules } from "@services/scheduleApi";
import { useAuth } from "@contexts/AuthContext"; // Giả sử path này đúng với project của bạn
import { Loading, Card } from "@components/common";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ArrowLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  BookOpen
} from "lucide-react";
import { toast } from "react-hot-toast";

const StudentTimetablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State quản lý thời gian và dữ liệu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date()); // Dùng Date object để dễ thao tác
  const [schedules, setSchedules] = useState([]);

  // --- LOGIC FETCH DATA ---

  // Tính toán range ngày dựa trên viewMode và currentDate
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === "week") {
      // Lấy ngày thứ 2 của tuần hiện tại
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);

      // Lấy chủ nhật
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      // Đầu tháng
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      // Cuối tháng
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    return { 
      start: start.toISOString(), 
      end: end.toISOString(),
      startDateObj: start,
      endDateObj: end
    };
  }, [currentDate, viewMode]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Gọi API thực tế với range ngày đã tính
        // API cần hỗ trợ query param ?startDate=...&endDate=...
        const data = await getMySchedules(dateRange.start, dateRange.end);
        
        // Đảm bảo data là array
        setSchedules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error loading schedules:", err);
        setError("Không thể tải lịch học. Vui lòng thử lại sau.");
        // Không fallback về mock data nữa
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [dateRange]);

  // --- HANDLERS ---

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // --- HELPER RENDERING ---

  // Tạo danh sách các ngày cần hiển thị trong Grid
  const calendarDays = useMemo(() => {
    const days = [];
    const start = new Date(dateRange.startDateObj);
    
    // Nếu là Month view, cần padding thêm các ngày của tháng trước để lấp đầy grid (nếu ngày 1 không phải T2)
    if (viewMode === "month") {
       const dayOfWeek = start.getDay(); // 0 is Sunday
       const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
       start.setDate(start.getDate() - paddingDays);
    }

    // Tạo mảng ngày (42 ô cho month view để chắc chắn cover hết, 7 ô cho week view)
    const totalDays = viewMode === "week" ? 7 : 42; 

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [dateRange, viewMode]);

  // Lọc lịch học cho một ngày cụ thể
  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => {
      // Giả sử API trả về field 'date' hoặc 'startTime' chứa ngày
      // Cần điều chỉnh tùy theo cấu trúc object trả về thực tế của DB bạn
      const scheduleDate = s.date || s.startTime; 
      return scheduleDate && scheduleDate.startsWith(dateStr);
    }).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSameMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (loading && schedules.length === 0) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-6 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <CalendarIcon size={20} className="text-white" />
                </div>
                Thời Khóa Biểu
              </h1>
              <p className="text-gray-500 text-sm mt-1 ml-12">
                Quản lý lịch học của <span className="font-bold text-[var(--color-secondary)]">{user?.fullName}</span>
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === "week"
                    ? "bg-white text-[var(--color-primary)] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === "month"
                    ? "bg-white text-[var(--color-primary)] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Tháng
              </button>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrev}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-[var(--color-primary)] min-w-[140px] text-center">
                {viewMode === 'week' 
                  ? `Tuần ${dateRange.startDateObj.getDate()}/${dateRange.startDateObj.getMonth()+1} - ${dateRange.endDateObj.getDate()}/${dateRange.endDateObj.getMonth()+1}`
                  : `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`
                }
              </span>
              <button 
                onClick={handleNext}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button 
              onClick={handleToday}
              className="text-sm font-medium text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Hôm nay
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
            <AlertCircle className="text-[var(--color-danger)]" size={20} />
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"].map((day, index) => (
            <div key={index} className="text-center font-bold text-gray-400 text-sm uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 gap-4 auto-rows-fr">
          {calendarDays.map((date, index) => {
            const daySchedules = getSchedulesForDate(date);
            const isCurrentMonth = viewMode === 'week' || isSameMonth(date);
            const isTodayDate = isToday(date);

            // Ẩn ngày của tháng khác nếu đang ở chế độ xem Tháng để giao diện sạch hơn (hoặc làm mờ)
            if (viewMode === 'month' && !isCurrentMonth && daySchedules.length === 0) {
               return <div key={index} className="min-h-[120px] bg-transparent"></div>; 
            }

            return (
              <div
                key={index}
                className={`
                  min-h-[150px] rounded-xl border p-2 transition-all duration-200
                  ${isTodayDate 
                    ? "bg-white border-[var(--color-secondary)] shadow-md ring-1 ring-[var(--color-secondary)]" 
                    : isCurrentMonth 
                      ? "bg-white border-gray-100 shadow-[var(--shadow-card)]" 
                      : "bg-gray-50/50 border-dashed border-gray-200 opacity-60"
                  }
                `}
              >
                {/* Date Number */}
                <div className="flex justify-between items-start mb-2">
                  <span 
                    className={`
                      text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                      ${isTodayDate 
                        ? "bg-[var(--color-secondary)] text-white" 
                        : isCurrentMonth 
                          ? "text-gray-700" 
                          : "text-gray-400"
                      }
                    `}
                  >
                    {date.getDate()}
                  </span>
                  {daySchedules.length > 0 && (
                    <span className="text-[10px] font-bold text-[var(--color-primary)] bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {daySchedules.length} lớp
                    </span>
                  )}
                </div>

                {/* Schedule Items */}
                <div className="space-y-2">
                  {daySchedules.length > 0 ? (
                    daySchedules.map((schedule, idx) => (
                      <div
                        key={schedule._id || idx}
                        className={`
                          p-2 rounded-lg text-xs border-l-2 cursor-pointer hover:shadow-md transition-shadow
                          bg-[var(--color-secondary)]/5 border-[var(--color-secondary)]
                        `}
                        onClick={() => navigate(`/student/courses/${schedule.course?._id || schedule.class?.course}`)}
                      >
                        <div className="font-bold text-[var(--color-primary)] truncate" title={schedule.course?.name || schedule.class?.name}>
                          {schedule.course?.name || schedule.class?.name || "Lớp học"}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 mt-1">
                          <Clock size={10} />
                          <span>{schedule.startTime?.slice(0, 5)} - {schedule.endTime?.slice(0, 5)}</span>
                        </div>
                        {(schedule.room || schedule.classroom) && (
                           <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                            <MapPin size={10} />
                            <span className="truncate">{schedule.room || schedule.classroom}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // Empty visual for today if no class
                    isTodayDate && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300 mt-4">
                        <BookOpen size={24} className="opacity-20" />
                        <span className="text-[10px] mt-1">Trống</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentTimetablePage;