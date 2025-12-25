import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks";
import { getMyEnrolledCourses } from "@services/enrollmentApi";
import { getMySchedules } from "@services/scheduleApi";
import { getMyGrades } from "@services/gradesApi";
import { Card, CardContent, CardHeader, CardTitle } from "@components/common";
import { Badge } from "@components/common";
import { Progress } from "@components/common";
import { Button } from "@components/common";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  MapPin,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

// Định nghĩa lại mã màu Hex trong JS để dùng cho Recharts (Vì Recharts khó nhận CSS Var trực tiếp)
const THEME_COLORS = {
  primary: "#132440",
  primaryLight: "#1a3254",
  accent: "#16476a",
  secondary: "#3b9797", // Màu Teal chủ đạo cho Chart
  secondaryLight: "#4eb5b5",
  danger: "#bf092f",
  highlight: "#770000",
  gray: "#e5e7eb",
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeCourses: 0,
      completedCourses: 0,
      totalHours: 0,
      avgAttendance: 0,
      avgGrade: 0,
    },
    courses: [],
    schedules: [],
    grades: [],
    attendanceTrend: [],
    gradeDistribution: [],
    noData: false,
  });

  // --- LOGIC GIỮ NGUYÊN ---
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesData, schedulesData, gradesData] = await Promise.all([
        getMyEnrolledCourses(),
        getMySchedules(),
        getMyGrades(),
      ]);

      console.debug("fetchDashboardData results:", {
        coursesData,
        schedulesData,
        gradesData,
      });

      const courses = Array.isArray(coursesData) ? coursesData : [];
      const schedules = Array.isArray(schedulesData) ? schedulesData : [];
      const grades = Array.isArray(gradesData) ? gradesData : [];

      // Treat newly enrolled / pending / in_progress statuses as active for student-facing dashboard
      const activeStatuses = new Set([
        "active",
        "pending",
        "in_progress",
        "enrolled",
      ]);
      const activeCourses = courses.filter(
        (c) => !c.status || activeStatuses.has(c.status)
      ).length;
      const completedCourses = courses.filter(
        (c) => c.status === "completed"
      ).length;
      const totalHours = courses.reduce(
        (sum, c) => sum + (c.course?.duration?.hours || 0),
        0
      );

      const avgAttendance =
        grades.length > 0
          ? Math.round(
              grades.reduce((sum, g) => sum + (g.attendance || 0), 0) /
                grades.length
            )
          : 0;

      const completedGrades = grades.filter((g) => g.finalScore);
      const avgGrade =
        completedGrades.length > 0
          ? (
              completedGrades.reduce((sum, g) => sum + g.finalScore, 0) /
              completedGrades.length
            ).toFixed(2)
          : 0;

      const attendanceTrend = generateAttendanceTrend(grades);
      const gradeDistribution = generateGradeDistribution(grades);

      const noDataFlag =
        (!Array.isArray(courses) || courses.length === 0) &&
        (!Array.isArray(schedules) || schedules.length === 0) &&
        (!Array.isArray(grades) || grades.length === 0);

      setDashboardData({
        stats: {
          activeCourses,
          completedCourses,
          totalHours,
          avgAttendance,
          avgGrade,
        },
        courses,
        schedules,
        grades,
        attendanceTrend,
        gradeDistribution,
        noData: noDataFlag,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activeCourses = useMemo(() => {
    const activeStatuses = new Set([
      "active",
      "pending",
      "in_progress",
      "enrolled",
    ]);
    return (dashboardData.courses || []).filter(
      (c) => !c.status || activeStatuses.has(c.status)
    );
  }, [dashboardData.courses]);
  const todaySchedules = useMemo(
    () => (dashboardData.schedules || []).slice(0, 3),
    [dashboardData.schedules]
  );

  const generateAttendanceTrend = useCallback((grades) => {
    const today = new Date();
    // last 6 days (inclusive of today)
    const days = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (5 - idx));
      const label = `T${idx + 1}`;
      const dateKey = d.toISOString().split("T")[0];

      const gradesForDay = grades.filter((g) => {
        if (!g.createdAt && !g.date) return false;
        const gDate = new Date(g.createdAt || g.date)
          .toISOString()
          .split("T")[0];
        return gDate === dateKey;
      });

      const attendanceAvg =
        gradesForDay.length > 0
          ? Math.round(
              gradesForDay.reduce((s, gg) => s + (gg.attendance || 0), 0) /
                gradesForDay.length
            )
          : 0;

      return { week: label, attendance: attendanceAvg };
    });

    return days;
  }, []);

  const generateGradeDistribution = useCallback((grades) => {
    const completedGrades = grades.filter((g) => g.finalScore);
    if (completedGrades.length === 0) return [];

    // Áp dụng bảng màu Theme vào biểu đồ tròn
    const distribution = [
      {
        name: "Xuất sắc",
        value: completedGrades.filter((g) => g.finalScore >= 8.5).length,
        color: THEME_COLORS.secondary, // Teal (Màu tích cực nhất)
      },
      {
        name: "Giỏi",
        value: completedGrades.filter(
          (g) => g.finalScore >= 7 && g.finalScore < 8.5
        ).length,
        color: THEME_COLORS.accent, // Xanh Navy sáng
      },
      {
        name: "Khá",
        value: completedGrades.filter(
          (g) => g.finalScore >= 5.5 && g.finalScore < 7
        ).length,
        color: THEME_COLORS.primary, // Xanh đậm
      },
      {
        name: "TB/Yếu",
        value: completedGrades.filter((g) => g.finalScore < 5.5).length,
        color: THEME_COLORS.danger, // Đỏ (Cảnh báo)
      },
    ];
    return distribution.filter((item) => item.value > 0);
  }, []);
  // --- END LOGIC ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-secondary)]"></div>
          <p className="text-[var(--color-primary)] text-sm animate-pulse">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  const { stats } = dashboardData;

  const showNoDataWarning = dashboardData.noData && user;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <p className="text-sm font-bold text-[var(--color-primary)]">
            {payload[0].value}%{" "}
            <span className="text-gray-500 font-normal">Chuyên cần</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span>Dashboard</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-11">
            Tổng quan học tập của{" "}
            <span className="font-bold text-[var(--color-accent)]">
              {user?.fullName}
            </span>
          </p>
        </div>
      </div>

      {showNoDataWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md text-sm text-yellow-800">
          <strong>Chú ý:</strong> Không có dữ liệu thống kê từ server. Kiểm tra
          trạng thái backend hoặc quyền truy cập (token).
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Đang Học"
          value={stats.activeCourses}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatsCard
          title="Hoàn Thành"
          value={stats.completedCourses}
          icon={<Award className="w-5 h-5" />}
        />
        <StatsCard
          title="Chuyên Cần"
          value={`${stats.avgAttendance}%`}
          icon={<Calendar className="w-5 h-5" />}
          trend={stats.avgAttendance >= 80 ? "up" : "down"}
        />
        <StatsCard
          title="Điểm TB"
          value={stats.avgGrade}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
          onClick={() => navigate("/student/requests")}
        >
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Lịch sử Yêu cầu</h3>
              <p className="text-xs text-gray-500">Theo dõi đơn từ</p>
            </div>
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500"
          onClick={() => navigate("/student/enroll")}
        >
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <Send size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Đăng ký / Tư vấn</h3>
              <p className="text-xs text-gray-500">Khóa học mới</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts & Courses) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <Card className="border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[var(--color-primary)]">
                <TrendingUp className="w-4 h-4 text-[var(--color-secondary)]" />
                Xu hướng chuyên cần
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.attendanceTrend}>
                    <defs>
                      <linearGradient
                        id="colorAttendance"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={THEME_COLORS.secondary}
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor={THEME_COLORS.secondary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={THEME_COLORS.gray}
                    />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: THEME_COLORS.accent, fontSize: 12 }}
                      dy={10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="attendance"
                      stroke={THEME_COLORS.secondary}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAttendance)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-secondary)]" />
              Khóa học đang diễn ra
            </h2>
            {activeCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyState message="Chưa có khóa học nào đang diễn ra" />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-card)] h-fit">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-[var(--color-primary)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--color-secondary)]" />
                Lịch học hôm nay
              </CardTitle>
              <Button
                variant="link"
                className="text-[var(--color-secondary)] text-xs p-0 h-auto font-medium hover:no-underline hover:text-[var(--color-secondary-dark)]"
                onClick={() => navigate("/student/schedule")}
              >
                Xem tất cả
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-0 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100 z-0"></div>

                {todaySchedules.length > 0 ? (
                  todaySchedules.map((schedule, idx) => (
                    <div
                      key={idx}
                      className="relative pl-6 py-3 z-10 hover:bg-gray-50 rounded-r-lg transition-colors group"
                    >
                      <div className="absolute left-0 top-5 h-4 w-4 rounded-full border-2 border-white bg-[var(--color-secondary-light)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]"></div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--color-secondary)] mb-0.5">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--color-primary)] line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
                          {schedule.course?.name}
                        </h4>
                        {schedule.classroom && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 text-[var(--color-secondary)]" />
                            <span>Phòng {schedule.classroom}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400">Không có lịch học</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[var(--color-primary)] flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--color-secondary)]" />
                Phân bố điểm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full flex items-center justify-center">
                {dashboardData.gradeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.gradeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {dashboardData.gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    Chưa có dữ liệu
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {dashboardData.gradeDistribution.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center text-xs text-gray-600"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mr-1.5"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    {item.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, trend }) => {
  return (
    <Card className="border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 bg-white">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-[var(--color-primary)]">
            {value}
          </h3>
          {trend && (
            <div
              className="flex items-center text-xs mt-2 font-medium"
              style={{
                color:
                  trend === "up"
                    ? "var(--color-secondary)"
                    : "var(--color-danger)",
              }}
            >
              {trend === "up" ? "▲ Tốt" : "▼ Cần chú ý"}
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  return (
    <Card
      className="group border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden bg-white"
      onClick={() => navigate(`/student/courses/${course.course?._id}`)}
    >
      <div className="h-1.5 bg-[var(--color-primary)] w-full opacity-90 group-hover:opacity-100 transition-opacity" />

      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <Badge
            variant="secondary"
            className="bg-gray-100 text-[var(--color-accent)] font-medium border-none px-2 py-0.5 text-xs"
          >
            {course.course?.code}
          </Badge>
          <div className="text-gray-300 group-hover:text-[var(--color-secondary)] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        <h3 className="font-bold text-base text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors line-clamp-2 mb-4 min-h-[3rem]">
          {course.course?.name}
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
              <span>Tiến độ</span>
              <span className="text-[var(--color-secondary)]">
                {course.progress || 0}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-secondary)] transition-all duration-500"
                style={{ width: `${course.progress || 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center text-xs text-gray-500 gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
              <span>{course.course?.duration?.weeks || 0} tuần</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
              <span>
                {new Date(course.enrollmentDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
    <div className="mb-3 p-3 bg-white rounded-full shadow-sm">
      <BookOpen className="w-6 h-6 text-[var(--color-secondary)]" />
    </div>
    <p className="text-gray-500 text-sm font-medium">{message}</p>
  </div>
);

export default StudentDashboard;
