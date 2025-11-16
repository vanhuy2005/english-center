import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Loading, Input } from "@components/common";
import {
  School,
  Search,
  Filter,
  Users,
  TrendingUp,
  BookOpen,
  BarChart3,
} from "lucide-react";
import api from "@services/api";
import { useNavigate } from "react-router-dom";

const ClassTrackingPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    courseId: "",
    status: "active",
  });
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.courseId) params.append("courseId", filters.courseId);
      if (filters.status) params.append("status", filters.status);

      const response = await api.get(`/staff/enrollment/classes?${params}`);
      const responseData = response.data.data || response.data;
      setClasses(Array.isArray(responseData) ? responseData : []);
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
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getCapacityStatus = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return { label: "Đầy", color: "red" };
    if (percentage >= 70) return { label: "Gần đầy", color: "yellow" };
    return { label: "Còn chỗ", color: "green" };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Đang học", color: "green" },
      upcoming: { label: "Sắp khai giảng", color: "blue" },
      completed: { label: "Đã kết thúc", color: "gray" },
    };
    return statusMap[status] || { label: status, color: "gray" };
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#132440] to-[#16476A] bg-clip-text text-transparent flex items-center gap-3">
            <School className="w-8 h-8 text-[#132440]" />
            Theo Dõi Lớp Học
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý sĩ số và tình trạng các lớp học
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Tìm kiếm lớp học..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B9797] focus:border-transparent"
              value={filters.courseId}
              onChange={(e) => handleFilterChange("courseId", e.target.value)}
            >
              <option value="">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} - {course.level}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B9797] focus:border-transparent"
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

      {/* Class List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => {
          const capacityStatus = getCapacityStatus(
            classItem.enrolledCount,
            classItem.capacity
          );
          const statusBadge = getStatusBadge(classItem.status);
          const percentage = (
            (classItem.enrolledCount / classItem.capacity) *
            100
          ).toFixed(0);

          return (
            <Card
              key={classItem._id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/classes/${classItem._id}`)}
            >
              {/* Class Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#132440]">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {classItem.course?.name || "N/A"}
                  </p>
                </div>
                <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
              </div>

              {/* Class Info */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảng viên:</span>
                  <span className="font-medium">
                    {classItem.teacher?.fullName || "Chưa phân công"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lịch học:</span>
                  <span className="font-medium">{classItem.schedule}</span>
                </div>
              </div>

              {/* Capacity Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Sĩ số:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#132440]">
                      {classItem.enrolledCount}/{classItem.capacity}
                    </span>
                    <Badge color={capacityStatus.color} size="sm">
                      {capacityStatus.label}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      percentage >= 90
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : percentage >= 70
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                        : "bg-gradient-to-r from-[#3B9797] to-[#16476A]"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {percentage}% đã đăng ký
                </div>
              </div>

              {/* Available Slots */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Chỗ trống:</span>
                  <span
                    className={`text-lg font-bold ${
                      classItem.capacity - classItem.enrolledCount === 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {classItem.capacity - classItem.enrolledCount}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {classes.length === 0 && (
        <Card className="p-12 text-center">
          <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không tìm thấy lớp học
          </h3>
          <p className="text-gray-500">
            Thử thay đổi bộ lọc để xem kết quả khác
          </p>
        </Card>
      )}

      {/* Summary Statistics */}
      {classes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#132440] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Thống Kê Tổng Quan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {classes.length}
              </div>
              <div className="text-sm text-gray-600">Tổng số lớp</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {classes.reduce((sum, c) => sum + c.enrolledCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Tổng học viên</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {classes.reduce((sum, c) => sum + c.capacity, 0)}
              </div>
              <div className="text-sm text-gray-600">Tổng sức chứa</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {classes.reduce(
                  (sum, c) => sum + (c.capacity - c.enrolledCount),
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Chỗ trống</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassTrackingPage;
