import React, { useState, useEffect } from "react";
import { studentService } from "../../services";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";

const StudentAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getMyAttendance();
      setAttendance(response.data || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(
        err.response?.data?.message || "Không thể tải dữ liệu chuyên cần"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      present: { color: "success", label: "Có mặt", icon: "✓" },
      absent: { color: "danger", label: "Vắng", icon: "✗" },
      late: { color: "warning", label: "Muộn", icon: "⏰" },
      excused: { color: "info", label: "Có phép", icon: "📝" },
    };
    const config = statusMap[status] || {
      color: "default",
      label: status,
      icon: "?",
    };
    return (
      <Badge color={config.color}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const courses = ["all", ...new Set(attendance.map((a) => a.courseName))];
  const filteredAttendance =
    selectedCourse === "all"
      ? attendance
      : attendance.filter((a) => a.courseName === selectedCourse);

  // Calculate statistics
  const totalSessions = filteredAttendance.length;
  const presentCount = filteredAttendance.filter(
    (a) => a.status === "present"
  ).length;
  const lateCount = filteredAttendance.filter(
    (a) => a.status === "late"
  ).length;
  const absentCount = filteredAttendance.filter(
    (a) => a.status === "absent"
  ).length;
  const excusedCount = filteredAttendance.filter(
    (a) => a.status === "excused"
  ).length;
  const attendanceRate =
    totalSessions > 0
      ? (((presentCount + excusedCount) / totalSessions) * 100).toFixed(1)
      : 0;

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chuyên cần</h1>
        <p className="text-gray-600">
          Lịch sử điểm danh và tỷ lệ chuyên cần của bạn
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {attendanceRate}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Tỷ lệ chuyên cần</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {presentCount}
            </div>
            <div className="text-sm text-gray-500 mt-1">Có mặt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {lateCount}
            </div>
            <div className="text-sm text-gray-500 mt-1">Đi muộn</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{absentCount}</div>
            <div className="text-sm text-gray-500 mt-1">Vắng mặt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {excusedCount}
            </div>
            <div className="text-sm text-gray-500 mt-1">Có phép</div>
          </div>
        </Card>
      </div>

      {/* Warning */}
      {attendanceRate < 80 && totalSessions > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">
                Cảnh báo chuyên cần
              </h3>
              <p className="text-sm text-yellow-700">
                Tỷ lệ chuyên cần của bạn đang dưới 80%. Vui lòng tham gia đầy đủ
                các buổi học để đạt yêu cầu tốt nghiệp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Lọc theo khóa học:
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courses.map((course) => (
              <option key={course} value={course}>
                {course === "all" ? "Tất cả khóa học" : course}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Attendance List */}
      {filteredAttendance.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600">Chưa có dữ liệu điểm danh</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Khóa học
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Lớp
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Buổi
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendance.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">
                        {new Date(record.date).toLocaleDateString("vi-VN")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-800">{record.courseName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-800">{record.className}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge color="default">{record.session}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {record.notes || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentAttendancePage;
