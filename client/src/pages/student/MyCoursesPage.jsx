import React, { useState, useEffect } from "react";
import { studentService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";

const MyCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getMyCourses();
      const activeCourses = (response.data || []).filter(
        (course) => course.status === "active"
      );
      setCourses(activeCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách khóa học"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { color: "success", label: "Đang học" },
      completed: { color: "info", label: "Hoàn thành" },
      pending: { color: "warning", label: "Chờ xác nhận" },
      cancelled: { color: "danger", label: "Đã hủy" },
    };
    const config = statusMap[status] || { color: "default", label: status };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Khóa học của tôi
        </h1>
        <p className="text-gray-600">
          Danh sách các khóa học bạn đang theo học
        </p>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600">Bạn chưa đăng ký khóa học nào</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} hover>
              <div className="space-y-4">
                {/* Course Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {course.name || course.courseName}
                    </h3>
                    {getStatusBadge(course.status)}
                  </div>
                  <p className="text-sm text-gray-600">{course.courseCode}</p>
                </div>

                {/* Class Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Lớp:</span>
                    <span className="font-medium">{course.className}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Giảng viên:</span>
                    <span className="font-medium">
                      {course.teacherName || "Chưa phân công"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-24">Thời gian:</span>
                    <span className="font-medium">{course.schedule}</span>
                  </div>
                </div>

                {/* Progress */}
                {course.status === "active" && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-medium">
                        {course.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {course.attendanceRate || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Chuyên cần</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {course.averageGrade || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">Điểm TB</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    onClick={() =>
                      (window.location.href = `/classes/${course.classId}`)
                    }
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
