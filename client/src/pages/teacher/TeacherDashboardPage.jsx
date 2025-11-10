import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Loading, Badge } from "../../components/common";
import { LineChart, BarChart } from "../../components/charts";
import {
  BookOpen,
  CheckCircle,
  Users,
  Calendar,
  Clock,
  Bell,
  TrendingUp,
  Award,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const TeacherDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClasses: 0,
      activeClasses: 0,
      totalStudents: 0,
      weekSessions: 0,
      completedSessions: 0,
      averageGrade: 0,
    },
    upcomingClasses: [],
    recentNotifications: [],
    gradesByClass: [],
    attendanceTrend: [],
  });

  useEffect(() => {
    if (user && user.profile && user.profile._id) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/teachers/dashboard");

      if (response.data && response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Giảng viên
          </h1>
          <p className="text-gray-600 mt-1">
            Chào mừng trở lại, {user?.profile?.fullName}! Hôm nay là{" "}
            {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
        <Button
          onClick={() => navigate("/teacher/schedule")}
          className="flex items-center gap-2"
        >
          <Calendar size={18} />
          Xem lịch đầy đủ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng số lớp"
          value={dashboardData.stats.totalClasses}
          icon={<BookOpen size={32} />}
          color="blue"
          subtitle="Đã được phân công"
        />
        <StatsCard
          title="Lớp đang dạy"
          value={dashboardData.stats.activeClasses}
          icon={<CheckCircle size={32} />}
          color="green"
          subtitle="Đang hoạt động"
        />
        <StatsCard
          title="Tổng học viên"
          value={dashboardData.stats.totalStudents}
          icon={<Users size={32} />}
          color="purple"
          subtitle="Trong tất cả lớp"
        />
        <StatsCard
          title="Buổi dạy tuần này"
          value={dashboardData.stats.weekSessions}
          icon={<Calendar size={32} />}
          color="orange"
          subtitle={`${dashboardData.stats.completedSessions} đã hoàn thành`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <Card title="Lớp học hôm nay" className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Clock size={18} />
            <span className="text-sm font-medium">Các lớp học sắp tới</span>
          </div>
          {dashboardData.upcomingClasses &&
          dashboardData.upcomingClasses.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingClasses.map((classItem) => (
                <div
                  key={classItem._id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/teacher/classes/${classItem._id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        {classItem.className}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <Clock size={14} />
                      {classItem.schedule?.join(", ")}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {classItem.currentStudents}/{classItem.maxStudents} học
                      viên
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/teacher/classes/${classItem._id}/attendance`
                        );
                      }}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Điểm danh
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/classes/${classItem._id}/grades`);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Award size={14} />
                      Nhập điểm
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không có lịch dạy hôm nay</p>
              <p className="text-sm mt-1">
                Hãy nghỉ ngơi hoặc chuẩn bị cho các buổi học sắp tới
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate("/teacher/schedule")}
              >
                Xem lịch tuần tới
              </Button>
            </div>
          )}
        </Card>

        {/* Notifications */}
        <Card title="Thông báo" className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Bell size={18} />
            <span className="text-sm font-medium">Thông báo mới nhất</span>
          </div>
          {dashboardData.recentNotifications &&
          dashboardData.recentNotifications.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.isRead
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-blue-50 hover:bg-blue-100"
                  }`}
                  onClick={() => {
                    if (notification.link) navigate(notification.link);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(notification.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                size="small"
                className="w-full mt-2"
                onClick={() => navigate("/teacher/notifications")}
              >
                Xem tất cả
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không có thông báo mới</p>
            </div>
          )}
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Điểm trung bình theo lớp">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Hiệu suất học tập</span>
          </div>
          {dashboardData.gradesByClass &&
          dashboardData.gradesByClass.length > 0 ? (
            <BarChart
              data={dashboardData.gradesByClass}
              xKey="className"
              yKey="averageGrade"
              color="#3B82F6"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có dữ liệu điểm</p>
            </div>
          )}
        </Card>

        <Card title="Xu hướng điểm danh">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">7 ngày qua</span>
          </div>
          {dashboardData.attendanceTrend &&
          dashboardData.attendanceTrend.length > 0 ? (
            <LineChart
              data={dashboardData.attendanceTrend}
              xKey="date"
              yKey="attendanceRate"
              color="#10B981"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có dữ liệu điểm danh</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card title="Tổng quan giảng dạy">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Buổi đã hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.completedSessions}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Award size={24} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Điểm trung bình</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.averageGrade
                    ? dashboardData.stats.averageGrade.toFixed(1)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Học viên trung bình/lớp</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.totalClasses > 0
                    ? Math.round(
                        dashboardData.stats.totalStudents /
                          dashboardData.stats.totalClasses
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const StatsCard = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value || 0}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>{icon}</div>
      </div>
    </Card>
  );
};

export default TeacherDashboardPage;
