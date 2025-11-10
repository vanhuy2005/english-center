import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge } from "@components/common";
import { LineChart, BarChart, PieChart } from "@components/charts";
import {
  reportService,
  studentService,
  teacherService,
  courseService,
  financeService,
} from "@services";
import { formatCurrency, formatDate } from "@utils/date";
import {
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

/**
 * Director Dashboard - Tổng quan hệ thống
 * Hiển thị:
 * - Statistics cards (học viên, giáo viên, doanh thu, khóa học)
 * - Line chart: Doanh thu theo thời gian
 * - Bar chart: Chuyên cần học viên
 * - Pie chart: Phân bổ học viên theo khóa học
 * - Table: Hoạt động gần đây
 */

const DirectorDashboard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    totalCourses: 0,
    newStudentsThisMonth: 0,
    revenueGrowth: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentDistribution, setStudentDistribution] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all data in parallel
      const [
        studentsRes,
        teachersRes,
        coursesRes,
        financeRes,
        revenueChartRes,
        attendanceChartRes,
        distributionRes,
        activitiesRes,
      ] = await Promise.all([
        studentService.getAll({ page: 1, pageSize: 1 }),
        teacherService.getAll({ page: 1, pageSize: 1 }),
        courseService.getAll({ page: 1, pageSize: 1 }),
        financeService.getOverview(),
        reportService.getRevenueChart({ period: "month", limit: 6 }),
        reportService.getAttendanceChart({ period: "week" }),
        reportService.getStudentDistribution(),
        reportService.getRecentActivities({ limit: 10 }),
      ]);

      // Set statistics
      setStats({
        totalStudents: studentsRes.pagination?.total || 0,
        totalTeachers: teachersRes.pagination?.total || 0,
        totalRevenue: financeRes.data?.totalRevenue || 0,
        totalCourses: coursesRes.pagination?.total || 0,
        newStudentsThisMonth: financeRes.data?.newStudentsThisMonth || 0,
        revenueGrowth: financeRes.data?.revenueGrowth || 0,
      });

      // Set chart data
      setRevenueData(revenueChartRes.data || []);
      setAttendanceData(attendanceChartRes.data || []);
      setStudentDistribution(distributionRes.data || []);
      setRecentActivities(activitiesRes.data || []);
    } catch (error) {
      setError(error);
      console.error("Error fetching dashboard data:", error);
      // Optionally: show toast/notification here
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text={t("common.loading")} />;
  }

  // Error UI
  if (error) {
    return (
      <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 max-w-lg w-full">
          <strong className="font-bold">{t("common.error")}: </strong>
          <span className="block">
            {t("dashboard.director.error.fetchFailed")}
          </span>
          <span className="block text-xs mt-2">
            {error.message || String(error)}
          </span>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {t("dashboard.director.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {formatDate(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          {t("common.refresh")}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <StatCard
          title={t("dashboard.director.totalStudents")}
          value={stats.totalStudents}
          icon={<Users className="w-8 h-8" />}
          color="bg-blue-500"
          subtitle={`+${stats.newStudentsThisMonth} ${t(
            "dashboard.director.thisMonth"
          )}`}
        />

        {/* Total Teachers */}
        <StatCard
          title={t("dashboard.director.totalTeachers")}
          value={stats.totalTeachers}
          icon={<GraduationCap className="w-8 h-8" />}
          color="bg-green-500"
        />

        {/* Total Revenue */}
        <StatCard
          title={t("dashboard.director.totalRevenue")}
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-8 h-8" />}
          color="bg-secondary"
          subtitle={
            <div className="flex items-center gap-1">
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={
                  stats.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"
                }
              >
                {stats.revenueGrowth}%
              </span>
            </div>
          }
        />

        {/* Total Courses */}
        <StatCard
          title={t("dashboard.director.totalCourses")}
          value={stats.totalCourses}
          icon={<BookOpen className="w-8 h-8" />}
          color="bg-accent"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card title={t("dashboard.director.revenueChart")}>
          <LineChart
            data={revenueData}
            lines={[
              {
                dataKey: "revenue",
                name: t("dashboard.director.revenue"),
                stroke: "#132440",
              },
              {
                dataKey: "profit",
                name: t("dashboard.director.profit"),
                stroke: "#3B9797",
              },
              {
                dataKey: "expenses",
                name: t("dashboard.director.expenses"),
                stroke: "#BF092F",
              },
            ]}
            height={300}
          />
        </Card>

        {/* Attendance Chart */}
        <Card title={t("dashboard.director.attendanceChart")}>
          <BarChart
            data={attendanceData}
            bars={[
              {
                dataKey: "present",
                name: t("dashboard.director.present"),
                fill: "#3B9797",
              },
              {
                dataKey: "absent",
                name: t("dashboard.director.absent"),
                fill: "#BF092F",
              },
              {
                dataKey: "late",
                name: t("dashboard.director.late"),
                fill: "#FFA500",
              },
            ]}
            height={300}
            stacked
          />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Distribution */}
        <Card
          title={t("dashboard.director.studentDistribution")}
          className="lg:col-span-1"
        >
          <PieChart
            data={studentDistribution}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </Card>

        {/* Recent Activities */}
        <Card
          title={t("dashboard.director.recentActivities")}
          className="lg:col-span-2"
        >
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {t("dashboard.director.noActivities")}
              </p>
            ) : (
              recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Department Overview */}
      <Card title={t("dashboard.director.departmentOverview")}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DepartmentCard
            name={t("dashboard.director.enrollment")}
            stats={{
              newEnrollments: 45,
              pendingApplications: 12,
            }}
            status="good"
            t={t}
          />
          <DepartmentCard
            name={t("dashboard.director.academic")}
            stats={{
              activeClasses: 28,
              avgAttendance: "92%",
            }}
            status="good"
            t={t}
          />
          <DepartmentCard
            name={t("dashboard.director.accounting")}
            stats={{
              collectionRate: "88%",
              pendingPayments: 15,
            }}
            status="warning"
            t={t}
          />
        </div>
      </Card>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
          )}
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </Card>
  );
};

/**
 * Activity Item Component
 */
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "enrollment":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "payment":
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case "class":
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
      </div>
      <div className="flex-shrink-0">
        <Badge variant={activity.status}>{activity.statusText}</Badge>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-400">
        {formatDate(activity.timestamp, "HH:mm")}
      </div>
    </div>
  );
};

/**
 * Department Card Component
 */
const DepartmentCard = ({ name, stats, status, t }) => {
  const statusColors = {
    good: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <Badge className={statusColors[status]}>
          {t(`dashboard.director.status.${status}`)}
        </Badge>
      </div>
      <div className="space-y-2">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-gray-600 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}:
            </span>
            <span className="font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectorDashboard;
