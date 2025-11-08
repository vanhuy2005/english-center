import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks";
import { studentService } from "../../services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/common";
import { Badge } from "@components/common";
import { Progress } from "@components/common";
import { Button } from "@components/common";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BookOpen, TrendingUp, Calendar, Award } from "lucide-react";
import toast from "react-hot-toast";

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
    attendanceTrend: [],
    gradeDistribution: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await studentService.getMyCourses();
      const courses = response.data || [];

      // Calculate stats
      const activeCourses = courses.filter((c) => c.status === "active").length;
      const completedCourses = courses.filter(
        (c) => c.status === "completed"
      ).length;
      const totalHours = courses.reduce(
        (sum, c) => sum + (c.totalHours || 0),
        0
      );
      const avgAttendance =
        courses.length > 0
          ? Math.round(
              courses.reduce((sum, c) => sum + (c.attendanceRate || 0), 0) /
                courses.length
            )
          : 0;
      const gradesData = courses.filter((c) => c.averageGrade);
      const avgGrade =
        gradesData.length > 0
          ? (
              gradesData.reduce(
                (sum, c) => sum + parseFloat(c.averageGrade),
                0
              ) / gradesData.length
            ).toFixed(2)
          : 0;

      // Mock attendance trend data (last 6 weeks)
      const attendanceTrend = [
        { week: "Tuần 1", attendance: 90 },
        { week: "Tuần 2", attendance: 95 },
        { week: "Tuần 3", attendance: 88 },
        { week: "Tuần 4", attendance: 92 },
        { week: "Tuần 5", attendance: 96 },
        { week: "Tuần 6", attendance: avgAttendance },
      ];

      // Mock grade distribution
      const gradeDistribution = [
        {
          name: "Xuất sắc",
          value: gradesData.filter((c) => parseFloat(c.averageGrade) >= 8.5)
            .length,
          color: "#dc2626",
        },
        {
          name: "Giỏi",
          value: gradesData.filter(
            (c) =>
              parseFloat(c.averageGrade) >= 7 &&
              parseFloat(c.averageGrade) < 8.5
          ).length,
          color: "#2563eb",
        },
        {
          name: "Khá",
          value: gradesData.filter(
            (c) =>
              parseFloat(c.averageGrade) >= 5.5 &&
              parseFloat(c.averageGrade) < 7
          ).length,
          color: "#f59e0b",
        },
        {
          name: "Trung bình",
          value: gradesData.filter((c) => parseFloat(c.averageGrade) < 5.5)
            .length,
          color: "#6b7280",
        },
      ].filter((item) => item.value > 0);

      setDashboardData({
        stats: {
          activeCourses,
          completedCourses,
          totalHours,
          avgAttendance,
          avgGrade,
        },
        courses,
        attendanceTrend,
        gradeDistribution,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { stats, courses, attendanceTrend, gradeDistribution } = dashboardData;
  const activeCourses = courses.filter((c) => c.status === "active");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Xin chào, {user?.fullName}!
        </h1>
        <p className="text-gray-600">
          Mã học viên: {user?.profile?.studentCode || "N/A"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Đang Học"
          value={stats.activeCourses}
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
          trend="+2 khóa mới"
        />
        <StatsCard
          title="Hoàn Thành"
          value={stats.completedCourses}
          icon={<Award className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Chuyên Cần TB"
          value={`${stats.avgAttendance}%`}
          icon={<Calendar className="w-6 h-6" />}
          color="red"
          trend={stats.avgAttendance >= 80 ? "Tốt" : "Cần cải thiện"}
        />
        <StatsCard
          title="Điểm TB"
          value={stats.avgGrade}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Chart */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-700">Xu hướng chuyên cần</CardTitle>
            <CardDescription>6 tuần gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis domain={[0, 100]} stroke="#6b7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: "#2563eb", r: 5 }}
                  name="Chuyên cần (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="border-t-4 border-t-red-500">
          <CardHeader>
            <CardTitle className="text-red-700">Phân bố kết quả</CardTitle>
            <CardDescription>Theo xếp loại</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-4xl mb-2">📝</p>
                <p>Chưa có dữ liệu điểm</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Courses */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Khóa học đang tham gia
        </h2>
        {activeCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chưa có khóa học nào</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, trend }) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: "text-green-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: "text-red-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      icon: "text-purple-600",
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <div className={colors.icon}>{icon}</div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-2">{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="border-t-4 border-t-red-500 hover:shadow-xl transition-all cursor-pointer group"
      onClick={() => navigate(`/classes/${course.classId}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {course.courseName}
          </CardTitle>
          <Badge className="bg-red-100 text-red-700">Đang học</Badge>
        </div>
        <CardDescription className="text-sm">
          {course.className}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tiến độ</span>
            <span className="font-semibold text-blue-600">
              {course.progress || 0}%
            </span>
          </div>
          <Progress value={course.progress || 0} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <div className="text-2xl font-bold text-red-600">
              {course.attendanceRate || 0}%
            </div>
            <div className="text-xs text-gray-500">Chuyên cần</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {course.averageGrade || "N/A"}
            </div>
            <div className="text-xs text-gray-500">Điểm TB</div>
          </div>
        </div>

        {course.teacherName && (
          <div className="flex items-center text-sm text-gray-600 pt-2 border-t border-gray-100">
            <Award className="w-4 h-4 mr-2 text-gray-400" />
            <span>GV: {course.teacherName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentDashboard;
