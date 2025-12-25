import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { LineChart, PieChart, BarChart } from "@components/charts";
import {
  TrendingDown,
  UserX,
  PauseCircle,
  AlertTriangle,
  Users,
  Clock,
  Calendar,
  MoreHorizontal,
  Activity,
  DollarSign,
  Phone,
  UserCheck,
} from "lucide-react";

import {
  retentionStats,
  retentionTrendData,
  dropoutReasonData,
  courseAnalysisData,
  studentLists,
  breakdownData,
  teacherRetentionData, // Thêm cái này
} from "./mockRetentionData";

const RetentionReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("atRisk"); // Tab state: atRisk | dropped | paused
  const [stats, setStats] = useState(retentionStats);
  const [trendData, setTrendData] = useState([]);
  const [reasonData, setReasonData] = useState([]);
  const [lists, setLists] = useState({ atRisk: [], dropped: [], paused: [] });
  const [courseAnalysis, setCourseAnalysis] = useState([]);
  const [teachers, setTeachers] = useState([]); // State giáo viên
  const [breakdown, setBreakdown] = useState({
    reasonsDetailed: [],
    duration: [],
    ageGroup: [],
  });

  useEffect(() => {
    fetchRetentionData();
  }, []);

  // Chart.js configs
  const trendLineConfig = React.useMemo(() => {
    const data = trendData.length > 0 ? trendData : retentionTrendData;
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: data.map((i) => i.name),
      datasets: [
        {
          label: "Tỉ lệ nghỉ",
          data: data.map((i) => i.dropoutRate || 0),
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244, 63, 94, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Tỉ lệ bảo lưu",
          data: data.map((i) => i.pauseRate || 0),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [trendData]);

  const courseBarConfig = React.useMemo(() => {
    const data =
      courseAnalysis.length > 0 ? courseAnalysis : courseAnalysisData;
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: data.map((i) => i.name),
      datasets: [
        {
          label: "Tỉ lệ nghỉ (%)",
          data: data.map((i) => i.dropoutRate || 0),
          backgroundColor: "#f43f5e",
          borderRadius: 4,
          barThickness: 30,
        },
        {
          label: "Tỉ lệ bảo lưu (%)",
          data: data.map((i) => i.pauseRate || 0),
          backgroundColor: "#fbbf24",
          borderRadius: 4,
          barThickness: 30,
        },
      ],
    };
  }, [courseAnalysis]);

  const reasonPieConfig = React.useMemo(() => {
    const data = reasonData.length > 0 ? reasonData : dropoutReasonData;
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: data.map((i) => i.name),
      datasets: [
        {
          data: data.map((i) => i.value || 0),
          backgroundColor: data.map((i) => i.color || "#3b82f6"),
          borderWidth: 0,
        },
      ],
    };
  }, [reasonData]);

  const fetchRetentionData = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStats(retentionStats);
      setTrendData(retentionTrendData);
      setReasonData(dropoutReasonData);
      setLists(studentLists); // Load cả 3 danh sách
      setCourseAnalysis(courseAnalysisData);
      setTeachers(teacherRetentionData);
      setBreakdown(breakdownData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading text="Đang phân tích dữ liệu..." />
      </div>
    );
  }


  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

 
  const getTableColumns = () => {
    const common = [
      { key: "studentInfo", label: "Học Viên", width: "250px" },
      { key: "course", label: "Khóa Học" },
      { key: "contact", label: "Liên Hệ" },
    ];

    if (activeTab === "atRisk") {
      return [
        ...common,
        { key: "metrics", label: "Chỉ Số Rủi Ro" },
        { key: "riskLevel", label: "Mức Độ", align: "center" },
        { key: "action", label: "Hành Động", align: "right" },
      ];
    } else if (activeTab === "dropped") {
      return [
        ...common,
        { key: "reason", label: "Lý Do Nghỉ" },
        { key: "date", label: "Ngày Nghỉ" },
        { key: "status", label: "Trạng Thái", align: "center" },
      ];
    } else { 
      return [
        ...common,
        { key: "reason", label: "Lý Do" },
        { key: "duration", label: "Thời Gian" }, // Từ ngày - Đến ngày
        { key: "status", label: "Trạng Thái", align: "center" },
      ];
    }
  };


  const getTableData = () => {
    const currentList = lists[activeTab] || [];

    return currentList.map((student) => ({
      studentInfo: (
        <div>
          <div className="font-semibold text-gray-900">{student.fullName}</div>
          <div className="text-xs text-gray-500 font-mono">
            {student.studentCode}
          </div>
        </div>
      ),
      course: student.course,
      contact: (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Phone className="w-3 h-3" /> {student.phone}
        </div>
      ),
     
      metrics: activeTab === "atRisk" && (
        <div className="text-sm">
          <div>
            CC:{" "}
            <span
              className={
                student.attendanceRate < 50
                  ? "text-red-600 font-bold"
                  : "text-gray-700"
              }
            >
              {student.attendanceRate}%
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Last: {student.lastAttendance}
          </div>
        </div>
      ),
      riskLevel: activeTab === "atRisk" && (
        <Badge variant={student.riskLevel === "high" ? "error" : "warning"}>
          {student.riskLevel === "high" ? "Cao" : "Trung bình"}
        </Badge>
      ),
      action: activeTab === "atRisk" && (
        <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded hover:bg-blue-100 transition-colors">
          Xử lý
        </button>
      ),
      reason: (activeTab !== "atRisk") && student.reason,
      date: (activeTab === "dropped") && student.leaveDate,
      duration: (activeTab === "paused") && (
        <div className="text-sm">
          <div>{student.startDate}</div>
          <div className="text-gray-400 text-xs">đến {student.endDate}</div>
        </div>
      ),
      status: activeTab !== "atRisk" && (
        <Badge variant="secondary">
          {activeTab === "dropped" ? "Đã nghỉ" : "Bảo lưu"}
        </Badge>
      ),
    }));
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Báo Cáo Giữ Chân (Retention)
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Kiểm soát tỉ lệ nghỉ học và tối ưu hóa doanh thu trung tâm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <Calendar className="w-4 h-4" /> Tháng này
          </button>
        </div>
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Tỉ Lệ Nghỉ"
          value={`${stats.dropoutRate}%`}
          icon={<UserX className="w-5 h-5" />}
          variant="red"
        />
        <StatCard
          title="Tỉ Lệ Bảo Lưu"
          value={`${stats.pauseRate}%`}
          icon={<PauseCircle className="w-5 h-5" />}
          variant="orange"
        />
        <StatCard
          title="HV Rủi Ro"
          value={stats.atRiskStudents}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="rose"
          subtitle="Cần xử lý gấp"
        />
        <StatCard
          title="Cứu Thành Công"
          value={`${stats.retentionSuccessRate}%`}
          icon={<UserCheck className="w-5 h-5" />}
          variant="green"
          subtitle="Tháng này"
        />
        {/* Card Doanh Thu Mất Đi - Quan trọng */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Thất Thoát Dự Kiến
              </p>
              <h3 className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.revenueLoss)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Do học viên nghỉ/bảo lưu
              </p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Xu Hướng Biến Động" className="lg:col-span-2 shadow-sm border-gray-200">
          <div className="mt-4">
            <LineChart
              data={trendLineConfig}
              height={280}
              options={{
                animation: false,
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
        </Card>

        {/* Teacher Performance (New) */}
        <Card
          title="Top Giáo Viên Giữ Chân"
          className="shadow-sm border-gray-200"
        >
          <div className="space-y-4 mt-2">
            {teachers.slice(0, 5).map((teacher, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < 3
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {teacher.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {teacher.studentCount} HV
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold text-sm ${
                      teacher.retentionRate >= 95
                        ? "text-green-600"
                        : teacher.retentionRate >= 90
                        ? "text-blue-600"
                        : "text-orange-500"
                    }`}
                  >
                    {teacher.retentionRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Analysis */}
        <Card
          title="Phân Tích Theo Khóa Học"
          className="lg:col-span-2 shadow-sm border-gray-200"
        >
          <div className="mt-4">
            <BarChart
              data={courseBarConfig}
              height={250}
              options={{
                animation: false,
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true },
                },
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
        </Card>
        <Card title="Nguyên Nhân Chính" className="shadow-sm border-gray-200">
          <div className="mt-4">
            <PieChart
              data={reasonPieConfig}
              height={250}
              options={{
                animation: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </Card>
      </div>

      
      <Card className="shadow-sm border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h3 className="font-bold text-lg text-gray-900">
            Danh Sách Chi Tiết
          </h3>

          {/* Tabs Navigation */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab("atRisk")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "atRisk"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline-block mr-1 mb-0.5" />{" "}
              Nguy Cơ Cao ({lists.atRisk.length})
            </button>
            <button
              onClick={() => setActiveTab("dropped")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "dropped"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <UserX className="w-4 h-4 inline-block mr-1 mb-0.5" /> Đã Nghỉ (
              {lists.dropped.length})
            </button>
            <button
              onClick={() => setActiveTab("paused")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "paused"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PauseCircle className="w-4 h-4 inline-block mr-1 mb-0.5" /> Bảo
              Lưu ({lists.paused.length})
            </button>
          </div>
        </div>

        <Table columns={getTableColumns()} data={getTableData()} />
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon, variant = "gray", subtitle }) => {
  const variants = {
    red: "bg-red-50 text-red-600 border-red-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const currentStyle = variants[variant] || variants.gray;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            {title}
          </p>
          <h3 className="text-xl font-bold text-gray-900">{value}</h3>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg shrink-0 ${currentStyle}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default RetentionReportPage;
