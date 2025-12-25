import React, { useState, useEffect } from "react";
import { Card, Loading, Badge } from "@components/common";
import { LineChart, BarChart, PieChart } from "@components/charts";
import { directorService } from "@services/directorService"; // Import Service vừa tạo
import { reportService } from "@services"; // For revenue chart API
import { revenueTrendData as mockRevenueTrendData } from "./mockRevenueData"; // Fallback mock
import {
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Clock,
} from "lucide-react";

const DirectorDashboard = () => {
  const [loading, setLoading] = useState(true);

  // State dữ liệu thực
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    totalCourses: 0,
    revenueGrowth: 12.5, 
  });

  const [revenueData, setRevenueData] = useState([]);

  // Mock data cho các phần chưa có API (để UI không bị trống)
  const attendanceData = [
    { day: "T2", present: 85, absent: 5, late: 10 },
    { day: "T3", present: 88, absent: 8, late: 4 },
    { day: "T4", present: 90, absent: 3, late: 7 },
    { day: "T5", present: 82, absent: 10, late: 8 },
    { day: "T6", present: 95, absent: 2, late: 3 },
    { day: "T7", present: 70, absent: 15, late: 15 },
  ];

  const studentDistribution = [
    { name: "IELTS", value: 45 },
    { name: "TOEIC", value: 30 },
    { name: "Giao tiếp", value: 55 },
    { name: "Thiếu nhi", value: 20 },
  ];

  const recentActivities = [
    {
      type: "enrollment",
      title: "Nguyễn Văn A",
      desc: "Đăng ký khóa IELTS 6.5",
      time: "10:30",
      status: "success",
    },
    {
      type: "payment",
      title: "Trần Thị B",
      desc: "Thanh toán học phí 5tr",
      time: "09:15",
      status: "success",
    },
    {
      type: "class",
      title: "Lớp TOEIC-01",
      desc: "Bắt đầu buổi học",
      time: "08:00",
      status: "info",
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Gọi dữ liệu song song từ Service
      const [overview, revenueChartRes] = await Promise.all([
        directorService.getOverviewStats(),
        reportService
          .getRevenueChart({ period: "month", limit: 6 })
          .catch((err) => {
            console.error("Dashboard revenue chart error:", err);
            return { data: mockRevenueTrendData };
          }),
      ]);

      
      if (overview) {
        setStats((prev) => ({ ...prev, ...overview }));
      }

      const chartData =
        revenueChartRes?.data?.data ||
        revenueChartRes?.data ||
        mockRevenueTrendData;
      const chartList = Array.isArray(chartData)
        ? chartData
        : mockRevenueTrendData;
      setRevenueData(chartList);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  // --- Chart.js configs (define before early returns) ---
  const revenueLineConfig = React.useMemo(() => {
    const list = Array.isArray(revenueData) ? revenueData : [];
    const labels = list.map((i) => i.name || i.month || i.label || "");
    return {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data: list.map((i) => i.revenue || 0),
          borderColor: "#132440",
          backgroundColor: "rgba(19, 36, 64, 0.12)",
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
        {
          label: "Lợi nhuận",
          data: list.map((i) => i.profit || 0),
          borderColor: "#3B9797",
          backgroundColor: "rgba(59, 151, 151, 0.12)",
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
        {
          label: "Chi phí",
          data: list.map((i) => i.expenses || 0),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
      ],
    };
  }, [revenueData]);

  const attendanceBarConfig = React.useMemo(() => {
    const list = Array.isArray(attendanceData) ? attendanceData : [];
    return {
      labels: list.map((i) => i.day),
      datasets: [
        {
          label: "Có mặt",
          data: list.map((i) => i.present || 0),
          backgroundColor: "#3B9797",
        },
        {
          label: "Vắng mặt",
          data: list.map((i) => i.absent || 0),
          backgroundColor: "#ef4444",
        },
        {
          label: "Trễ",
          data: list.map((i) => i.late || 0),
          backgroundColor: "#f59e0b",
        },
      ],
    };
  }, []);

  const distributionPieConfig = React.useMemo(() => {
    const list = Array.isArray(studentDistribution) ? studentDistribution : [];
    return {
      labels: list.map((i) => i.name),
      datasets: [
        {
          data: list.map((i) => i.value || 0),
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#8b5cf6",
            "#ef4444",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loading size="large" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#132440] flex items-center gap-3">
              <div className="p-2 bg-[#132440] rounded-lg shadow-sm">
                <Activity className="w-6 h-6 text-white" />
              </div>
              Dashboard Giám Đốc
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Tổng quan tình hình hoạt động của trung tâm
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <Clock size={16} />
            <span>Cập nhật: {new Date().toLocaleDateString("vi-VN")}</span>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng Học Viên"
            value={stats.totalStudents}
            icon={<Users className="w-6 h-6" />}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
            subtitle="Học viên đang theo học"
          />

          <StatCard
            title="Tổng Giáo Viên"
            value={stats.totalTeachers}
            icon={<GraduationCap className="w-6 h-6" />}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
            subtitle="Đội ngũ giảng dạy"
          />

          <StatCard
            title="Tổng Doanh Thu"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="w-6 h-6" />}
            colorClass="text-[#3b9797]"
            bgClass="bg-[#3b9797]/10"
            subtitle={
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <TrendingUp size={14} /> +{stats.revenueGrowth}% so với tháng
                trước
              </span>
            }
          />

          <StatCard
            title="Khóa Học Hoạt Động"
            value={stats.totalCourses}
            icon={<BookOpen className="w-6 h-6" />}
            colorClass="text-purple-600"
            bgClass="bg-purple-50"
            subtitle="Lớp đang mở"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
              <TrendingUp size={20} className="text-[#132440]" /> Biểu Đồ Doanh
              Thu (6 Tháng)
            </h3>
            {revenueLineConfig.labels.length > 0 ? (
              <LineChart
                data={revenueLineConfig}
                height={300}
                options={{
                  animation: false,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                Chưa có dữ liệu giao dịch
              </div>
            )}
          </Card>

          {/* Attendance Chart */}
          <Card className="border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
              <Users size={20} className="text-[#3B9797]" /> Chuyên Cần Tuần Này
            </h3>
            <BarChart
              data={attendanceBarConfig}
              height={300}
              options={{
                animation: false,
                scales: {
                  x: { stacked: true, grid: { display: false } },
                  y: { stacked: true, beginAtZero: true },
                },
                plugins: { legend: { position: "top" } },
              }}
            />
          </Card>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <Card className="lg:col-span-1 border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
              <BookOpen size={20} className="text-blue-600" /> Phân Bố Học Viên
            </h3>
            <PieChart
              data={distributionPieConfig}
              height={300}
              options={{
                animation: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </Card>

          
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
              <Clock size={20} className="text-gray-500" /> Hoạt Động Gần Đây
            </h3>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </Card>
        </div>

        <Card className="border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
            <Briefcase size={20} className="text-[#132440]" /> Tổng Quan Các Bộ
            Phận
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DepartmentCard
              name="Tuyển sinh"
              stats={{ "Khách mới": 45, "Chờ xử lý": 12 }}
              status="good"
            />
            <DepartmentCard
              name="Học vụ"
              stats={{ "Lớp active": 28, "Chuyên cần TB": "92%" }}
              status="good"
            />
            <DepartmentCard
              name="Kế toán"
              stats={{ "Tỉ lệ thu": "88%", "Công nợ": 15 }}
              status="warning"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};



const StatCard = ({ title, value, icon, colorClass, bgClass, subtitle }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className={`text-2xl font-extrabold ${colorClass}`}>{value}</h3>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>{icon}</div>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case "enrollment":
        return <Users size={16} className="text-blue-500" />;
      case "payment":
        return <DollarSign size={16} className="text-green-500" />;
      default:
        return <BookOpen size={16} className="text-purple-500" />;
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
      <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">{activity.title}</p>
        <p className="text-xs text-gray-500">{activity.desc}</p>
      </div>
      <div className="text-right">
        <Badge
          variant={activity.status}
          className="text-[10px] px-2 py-0.5 mb-1 block w-fit ml-auto"
        >
          {activity.status === "success" ? "Hoàn thành" : "Thông tin"}
        </Badge>
        <span className="text-[10px] text-gray-400">{activity.time}</span>
      </div>
    </div>
  );
};

const DepartmentCard = ({ name, stats, status }) => {
  const config = {
    good: {
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      icon: <CheckCircle size={14} />,
      text: "Ổn định",
    },
    warning: {
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-100",
      icon: <AlertCircle size={14} />,
      text: "Cần chú ý",
    },
  }[status];

  return (
    <div className={`p-5 rounded-xl border ${config.border} ${config.bg}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold ${config.color}`}>{name}</h3>
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-white/60 ${config.color}`}
        >
          {config.icon} {config.text}
        </span>
      </div>
      <div className="space-y-2">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between text-xs font-medium text-gray-600 border-b border-black/5 pb-1 last:border-0"
          >
            <span>{key}:</span>
            <span className="font-bold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectorDashboard;
