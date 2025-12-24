import React, { useState, useEffect } from "react";
import { Card, Loading, Badge, Input } from "@components/common";
import {
  School,
  Search,
  Filter,
  BookOpen,
  BarChart3,
  Users,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import { classService } from "@services/classService";
import api from "@config/api";

const ClassTrackingPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    courseId: "",
    status: "",
  });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, [filters]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await classService.getClasses({
        search: filters.search,
        status: filters.status,
        courseId: filters.courseId,
      });
      // Xử lý dữ liệu an toàn
      const classList = response?.data?.classes || response?.classes || [];
      setClasses(classList);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      const coursesData = Array.isArray(response.data)
        ? response.data
        : response.data?.courses || [];
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Logic tính toán phần trăm & trạng thái
  const getCapacityInfo = (current, max) => {
    const enrolled = Number(current) || 0;
    const capacity = Number(max) || 0;

    // Fix lỗi chia cho 0 hoặc null -> NaN
    if (capacity === 0)
      return { percent: 0, status: { label: "Chưa xác định", color: "gray" } };

    const percentage = Math.round((enrolled / capacity) * 100);

    let status = { label: "Còn chỗ", color: "success" }; // Xanh lá
    if (percentage >= 100) status = { label: "Đã đầy", color: "danger" }; // Đỏ
    else if (percentage >= 80) status = { label: "Sắp đầy", color: "warning" }; // Vàng

    return { percent: percentage, status };
  };

  const getStatusBadge = (status) => {
    const map = {
      active: { label: "Đang học", color: "success" },
      upcoming: { label: "Sắp khai giảng", color: "primary" }, // Xanh dương
      completed: { label: "Đã kết thúc", color: "secondary" }, // Xám
      cancelled: { label: "Đã hủy", color: "danger" },
    };
    return map[status] || { label: status || "N/A", color: "secondary" };
  };

  // Helper: Format schedule (object | array | string) into readable string
  const formatSchedule = (schedule) => {
    if (!schedule) return "";
    if (typeof schedule === "string") return schedule;

    if (Array.isArray(schedule)) {
      return schedule
        .map((s) => {
          if (!s) return "";
          if (typeof s === "string") return s;
          const day = s.dayOfWeek ?? s.day ?? s.days ?? "TBA";
          const start = s.startTime ?? s.start ?? "?";
          const end = s.endTime ?? s.end ?? "?";
          return `${day}: ${start} - ${end}`;
        })
        .filter(Boolean)
        .join(", ");
    }

    if (typeof schedule === "object") {
      const day = schedule.dayOfWeek ?? schedule.day ?? schedule.days ?? "TBA";
      const start = schedule.startTime ?? schedule.start ?? "?";
      const end = schedule.endTime ?? schedule.end ?? "?";
      return `${day}: ${start} - ${end}`;
    }

    return String(schedule);
  };

  // Helper: deterministic number based on string to make fallback stable
  const seededNumberFromString = (str) => {
    if (!str) return 0;
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    }
    return h;
  };

  const getFallbackCapacity = (id, enrolled) => {
    const seed = seededNumberFromString(String(id || "fallback"));
    const add = (seed % 11) + 5; // 5..15
    const value = Math.max(Number(enrolled) + add, 10);
    return value;
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loading size="large" />
      </div>
    );

  // Tính toán thống kê
  const totalClasses = classes.length;
  const totalStudents = classes.reduce(
    (sum, c) =>
      sum + (Number(c.currentEnrollment) || Number(c.students?.length) || 0),
    0
  );
  const totalCapacity = classes.reduce((sum, c) => {
    const raw = Number(c.capacity) || 0;
    const enrolled =
      Number(c.currentEnrollment) || Number(c.students?.length) || 0;
    const dc =
      raw > 0 ? raw : getFallbackCapacity(c._id || c.id || c.code, enrolled);
    return sum + dc;
  }, 0);
  const totalFreeSlots = Math.max(0, totalCapacity - totalStudents);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-6 font-sans text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#132440] flex items-center gap-3">
            <div className="p-2 bg-[#132440] rounded-lg shadow-sm">
              <School className="w-6 h-6 text-white" />
            </div>
            Theo Dõi Lớp Học
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Quản lý sĩ số, tình trạng và hiệu suất các lớp học hiện tại
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Tổng số lớp"
          value={totalClasses}
          icon={<School size={24} />}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label="Tổng học viên"
          value={totalStudents}
          icon={<Users size={24} />}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          label="Tổng sức chứa"
          value={totalCapacity}
          icon={<BarChart3 size={24} />}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          label="Chỗ trống"
          value={totalFreeSlots}
          icon={<User size={24} />}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm p-1">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Tìm kiếm theo tên lớp, mã lớp..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B9797] outline-none text-sm transition-all"
            />
          </div>

          <div className="w-full md:w-64 relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B9797] outline-none text-sm appearance-none cursor-pointer"
              value={filters.courseId}
              onChange={(e) => handleFilterChange("courseId", e.target.value)}
            >
              <option value="">Tất cả khóa học</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title || c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B9797] outline-none text-sm appearance-none cursor-pointer"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang học</option>
              <option value="upcoming">Sắp khai giảng</option>
              <option value="completed">Đã kết thúc</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Class Grid */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const enrolled =
              Number(cls.currentEnrollment) ||
              Number(cls.students?.length) ||
              0;
            const rawCapacity = Number(cls.capacity) || 0;
            const displayCapacity =
              rawCapacity > 0
                ? rawCapacity
                : getFallbackCapacity(cls._id || cls.id || cls.code, enrolled);

            // --- [FIXED] Sửa lỗi cú pháp ở đoạn này ---
            const { percent, status: capStatus } = getCapacityInfo(
              enrolled,
              displayCapacity
            );

            // Lấy badge status (thiếu trong code gốc)
            const statusBadge = getStatusBadge(cls.status);

            return (
              <div
                key={cls._id}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#3B9797] transition-all duration-200 flex flex-col h-full"
              >
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-2">
                      <h3
                        className="font-bold text-gray-800 text-lg group-hover:text-[#3B9797] transition-colors line-clamp-1"
                        title={cls.name}
                      >
                        {cls.name || "Lớp học chưa đặt tên"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                          {cls.code || cls.classCode || "NO-CODE"}
                        </span>
                      </div>
                    </div>
                    {/* Sử dụng biến statusBadge đã được khai báo */}
                    <Badge variant={statusBadge.color} className="shrink-0">
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 text-sm text-gray-600 mb-5 flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen size={15} className="text-[#3B9797]" />
                      <span className="truncate font-medium">
                        {cls.course?.title ||
                          cls.course?.name ||
                          "Khóa học chung"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-[#3B9797]" />
                      <span>
                        {cls.teacher?.fullName ||
                          cls.teacher?.name ||
                          "Chưa phân công"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-[#3B9797]" />
                      <span>
                        {cls.startDate
                          ? new Date(cls.startDate).toLocaleDateString("vi-VN")
                          : "TBA"}
                      </span>
                    </div>
                    {cls.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-[#3B9797]" />
                        <span className="italic">
                          {formatSchedule(cls.schedule)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-auto">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Sĩ số
                      </span>
                      <div className="text-right">
                        <span
                          className={`text-sm font-bold ${
                            percent >= 100 ? "text-red-600" : "text-gray-800"
                          }`}
                        >
                          {enrolled}
                        </span>
                        <span className="text-xs text-gray-400">
                          /{displayCapacity}
                          {rawCapacity === 0 && (
                            <span className="ml-1 text-xs italic text-gray-400">
                              (ước tính)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rawCapacity === 0
                            ? "bg-gray-300"
                            : percent >= 100
                            ? "bg-red-500"
                            : percent >= 80
                            ? "bg-orange-400"
                            : "bg-[#3B9797]"
                        }`}
                        style={{
                          width: `${
                            rawCapacity === 0 ? 0 : Math.min(percent, 100)
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span
                        className={`font-semibold ${
                          rawCapacity === 0
                            ? "text-gray-400"
                            : percent >= 100
                            ? "text-red-600"
                            : percent >= 80
                            ? "text-orange-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {capStatus.label}
                      </span>
                      <span className="text-gray-500 font-medium">
                        {`${percent}%`}
                        {rawCapacity === 0 && (
                          <span className="ml-1 text-xs italic text-gray-400">
                            (ước tính)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 rounded-b-xl flex justify-between items-center">
                  <button className="text-xs font-semibold text-gray-500 hover:text-[#3B9797] transition-colors">
                    Xem lịch học
                  </button>
                  <button className="text-xs font-medium text-white bg-[#132440] hover:bg-[#1d3557] px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1">
                    <Users size={14} /> Danh sách HV
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="p-4 bg-gray-50 rounded-full mb-3">
            <School size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium text-lg">
            Không tìm thấy lớp học nào
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Vui lòng thử lại với bộ lọc khác hoặc tạo lớp học mới
          </p>
        </div>
      )}
    </div>
  );
};

// Component con hiển thị thẻ thống kê
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-2xl font-extrabold ${color} mt-1`}>{value}</p>
    </div>
    <div className={`p-3 rounded-xl ${bg} ${color}`}>{icon}</div>
  </div>
);

export default ClassTrackingPage;
