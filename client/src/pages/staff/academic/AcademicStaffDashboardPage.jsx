import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import api from "@services/api";
import { Card, Loading } from "@components/common";
import {
  BookOpen,
  Users,
  CheckCircle,
  TrendingUp,
  Calendar,
  AlertCircle,
  FileText,
  BarChart3,
} from "lucide-react";
import { BarChart, LineChart, DoughnutChart } from "@components/charts";

const AcademicStaffDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClasses: 0,
      totalStudents: 0,
      attendanceRate: 0,
      averageGrade: 0,
      pendingRequests: 0,
      lowAttendanceStudents: 0,
    },
    recentClasses: [],
    pendingRequests: [],
    attendanceTrend: { labels: [], datasets: [] },
    gradeDistribution: { labels: [], datasets: [] },
    classPerformance: { labels: [], datasets: [] },
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/academic/dashboard");

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const {
    stats,
    recentClasses,
    pendingRequests,
    attendanceTrend,
    gradeDistribution,
    classPerformance,
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng Quan Học Vụ</h1>
          <p className="text-gray-600 mt-1">
            Chào mừng, {user?.profile?.fullName || "Nhân viên học vụ"}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>{new Date().toLocaleDateString("vi-VN")}</div>
          <div>
            {new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Classes */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng Số Lớp</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalClasses}</h3>
              <p className="text-blue-100 text-xs mt-1">Đang quản lý</p>
            </div>
            <BookOpen size={48} className="text-blue-200 opacity-80" />
          </div>
        </Card>

        {/* Total Students */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Tổng Học Viên
              </p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalStudents}</h3>
              <p className="text-green-100 text-xs mt-1">Đang học tập</p>
            </div>
            <Users size={48} className="text-green-200 opacity-80" />
          </div>
        </Card>

        {/* Attendance Rate */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Tỉ Lệ Chuyên Cần
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.attendanceRate}%
              </h3>
              <p className="text-purple-100 text-xs mt-1">Trung bình</p>
            </div>
            <CheckCircle size={48} className="text-purple-200 opacity-80" />
          </div>
        </Card>

        {/* Average Grade */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                Điểm Trung Bình
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.averageGrade.toFixed(1)}
              </h3>
              <p className="text-orange-100 text-xs mt-1">Toàn trung tâm</p>
            </div>
            <TrendingUp size={48} className="text-orange-200 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card
          className="border-l-4 border-yellow-500 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/academic/requests")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="text-yellow-500" size={20} />
                <h3 className="font-semibold text-gray-900">
                  Yêu Cầu Chờ Xử Lý
                </h3>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.pendingRequests}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Yêu cầu cần phê duyệt
              </p>
            </div>
            <FileText size={40} className="text-yellow-300" />
          </div>
        </Card>

        {/* Low Attendance Students */}
        <Card
          className="border-l-4 border-red-500 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/academic/students")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                <h3 className="font-semibold text-gray-900">
                  Học Viên Chuyên Cần Kém
                </h3>
              </div>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.lowAttendanceStudents}
              </p>
              <p className="text-sm text-gray-600 mt-1">Dưới 80% số buổi học</p>
            </div>
            <Users size={40} className="text-red-300" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Xu Hướng Chuyên Cần
            </h3>
          </div>
          <LineChart data={attendanceTrend} height={250} />
        </Card>

        {/* Grade Distribution */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Phân Bố Điểm Số
            </h3>
          </div>
          <DoughnutChart data={gradeDistribution} height={250} />
        </Card>
      </div>

      {/* Class Performance */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">
            Kết Quả Theo Lớp
          </h3>
        </div>
        <BarChart data={classPerformance} height={300} />
      </Card>

      {/* Recent Classes & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Classes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Lớp Học Gần Đây
            </h3>
            <button
              onClick={() => navigate("/academic/classes")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem Tất Cả →
            </button>
          </div>
          <div className="space-y-3">
            {recentClasses.length > 0 ? (
              recentClasses.map((classData) => (
                <div
                  key={classData._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/academic/classes/${classData._id}`)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {classData.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {classData.studentsCount} học viên
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={14} />
                        {classData.attendanceRate}% chuyên cần
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        classData.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {classData.status === "active"
                        ? "Đang học"
                        : "Đã kết thúc"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Không có lớp học nào
              </p>
            )}
          </div>
        </Card>

        {/* Pending Requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Yêu Cầu Chờ Xử Lý
            </h3>
            <button
              onClick={() => navigate("/academic/requests")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem Tất Cả →
            </button>
          </div>
          <div className="space-y-3">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/academic/requests`)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {request.type === "transfer" && "Xin chuyển lớp"}
                      {request.type === "defer" && "Xin bảo lưu"}
                      {request.type === "leave" && "Xin nghỉ học"}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.student?.fullName} - {request.class?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                      Chờ xử lý
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Không có yêu cầu nào
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao Tác Nhanh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/academic/classes")}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <BookOpen className="text-blue-600 mb-2" size={28} />
            <span className="text-sm font-medium text-blue-900">
              Quản Lý Lớp
            </span>
          </button>
          <button
            onClick={() => navigate("/academic/attendance")}
            className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <CheckCircle className="text-green-600 mb-2" size={28} />
            <span className="text-sm font-medium text-green-900">
              Điểm Danh
            </span>
          </button>
          <button
            onClick={() => navigate("/academic/grades")}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <TrendingUp className="text-purple-600 mb-2" size={28} />
            <span className="text-sm font-medium text-purple-900">
              Quản Lý Điểm
            </span>
          </button>
          <button
            onClick={() => navigate("/academic/reports")}
            className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <FileText className="text-orange-600 mb-2" size={28} />
            <span className="text-sm font-medium text-orange-900">Báo Cáo</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AcademicStaffDashboardPage;
