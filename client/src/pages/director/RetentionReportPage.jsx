import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { LineChart, PieChart, BarChart } from "@components/charts";
import { reportService } from "@services";
import {
  TrendingDown,
  UserX,
  Pause,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";

/**
 * Retention Report Page - Tỉ lệ nghỉ học và bảo lưu
 */
const RetentionReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dropoutRate: 0,
    pauseRate: 0,
    totalDropouts: 0,
    totalPauses: 0,
    atRiskStudents: 0,
  });
  const [trendData, setTrendData] = useState([]);
  const [reasonData, setReasonData] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);
  const [courseAnalysis, setCourseAnalysis] = useState([]);

  useEffect(() => {
    fetchRetentionData();
  }, []);

  const fetchRetentionData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendRes, reasonRes, atRiskRes, courseRes] =
        await Promise.all([
          reportService.getRetentionStats(),
          reportService.getRetentionTrend({ limit: 12 }),
          reportService.getDropoutReasons(),
          reportService.getAtRiskStudents({ limit: 20 }),
          reportService.getRetentionByCourse(),
        ]);

      setStats(statsRes.data || stats);
      setTrendData(trendRes.data || []);
      setReasonData(reasonRes.data || []);
      setAtRiskList(atRiskRes.data || []);
      setCourseAnalysis(courseRes.data || []);
    } catch (error) {
      console.error("Error fetching retention data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải báo cáo nghỉ học..." />;
  }

  const tableColumns = [
    { key: "studentCode", label: "Mã HV" },
    { key: "fullName", label: "Họ và Tên" },
    { key: "course", label: "Khóa Học" },
    { key: "attendance", label: "Chuyên Cần" },
    { key: "lastAttendance", label: "Lần Cuối Học" },
    { key: "riskLevel", label: "Mức Độ Rủi Ro" },
    { key: "action", label: "Hành Động" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tỉ Lệ Nghỉ Học & Bảo Lưu
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và phân tích tình trạng nghỉ học, bảo lưu
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Tỉ Lệ Nghỉ Học"
          value={`${stats.dropoutRate}%`}
          icon={<UserX className="w-8 h-8" />}
          color="bg-red-600"
        />
        <StatCard
          title="Tỉ Lệ Bảo Lưu"
          value={`${stats.pauseRate}%`}
          icon={<Pause className="w-8 h-8" />}
          color="bg-orange-600"
        />
        <StatCard
          title="Số HV Nghỉ"
          value={stats.totalDropouts}
          icon={<TrendingDown className="w-8 h-8" />}
          color="bg-gray-600"
        />
        <StatCard
          title="Số HV Bảo Lưu"
          value={stats.totalPauses}
          icon={<Clock className="w-8 h-8" />}
          color="bg-yellow-600"
        />
        <StatCard
          title="HV Có Rủi Ro"
          value={stats.atRiskStudents}
          icon={<AlertTriangle className="w-8 h-8" />}
          color="bg-purple-600"
        />
      </div>

      {/* Alert Banner */}
      {stats.atRiskStudents > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-sm font-bold text-red-900">
                Cảnh Báo: {stats.atRiskStudents} học viên có nguy cơ nghỉ học
                cao!
              </h3>
              <p className="text-xs text-red-700 mt-1">
                Cần liên hệ và tư vấn kịp thời để giữ chân học viên
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention Trend */}
        <Card title="Xu Hướng Nghỉ Học & Bảo Lưu" className="lg:col-span-2">
          <LineChart
            data={trendData}
            lines={[
              {
                dataKey: "dropoutRate",
                name: "Tỉ lệ nghỉ học",
                stroke: "#dc2626",
              },
              {
                dataKey: "pauseRate",
                name: "Tỉ lệ bảo lưu",
                stroke: "#f59e0b",
              },
            ]}
            height={300}
          />
        </Card>

        {/* Dropout Reasons */}
        <Card title="Lý Do Nghỉ Học">
          <PieChart
            data={reasonData}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </Card>
      </div>

      {/* Course Analysis */}
      <Card title="Phân Tích Theo Khóa Học">
        <BarChart
          data={courseAnalysis}
          bars={[
            {
              dataKey: "dropoutRate",
              name: "Tỉ lệ nghỉ",
              fill: "#dc2626",
            },
            {
              dataKey: "pauseRate",
              name: "Tỉ lệ bảo lưu",
              fill: "#f59e0b",
            },
          ]}
          height={300}
        />
      </Card>

      {/* At-Risk Students Table */}
      <Card title="Danh Sách Học Viên Có Nguy Cơ Cao">
        <Table
          columns={tableColumns}
          data={atRiskList.map((student) => ({
            studentCode: student.studentCode,
            fullName: student.fullName,
            course: student.course,
            attendance: (
              <Badge
                variant={
                  student.attendanceRate < 50
                    ? "danger"
                    : student.attendanceRate < 70
                    ? "warning"
                    : "default"
                }
              >
                {student.attendanceRate}%
              </Badge>
            ),
            lastAttendance: student.lastAttendance,
            riskLevel: (
              <Badge
                variant={
                  student.riskLevel === "high"
                    ? "danger"
                    : student.riskLevel === "medium"
                    ? "warning"
                    : "default"
                }
              >
                {student.riskLevel === "high"
                  ? "Cao"
                  : student.riskLevel === "medium"
                  ? "Trung Bình"
                  : "Thấp"}
              </Badge>
            ),
            action: (
              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                Liên Hệ
              </button>
            ),
          }))}
        />
      </Card>

      {/* Statistics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Lý Do Nghỉ Học Chi Tiết">
          <div className="space-y-3">
            <StatusItem label="Học phí cao" count={15} color="bg-red-500" />
            <StatusItem
              label="Chất lượng giảng dạy"
              count={8}
              color="bg-orange-500"
            />
            <StatusItem
              label="Không phù hợp"
              count={12}
              color="bg-yellow-500"
            />
            <StatusItem label="Lý do cá nhân" count={10} color="bg-gray-500" />
          </div>
        </Card>

        <Card title="Thời Gian Nghỉ">
          <div className="space-y-3">
            <StatusItem label="< 1 tháng" count={5} color="bg-red-500" />
            <StatusItem label="1-3 tháng" count={12} color="bg-orange-500" />
            <StatusItem label="3-6 tháng" count={18} color="bg-yellow-500" />
            <StatusItem label="> 6 tháng" count={10} color="bg-gray-500" />
          </div>
        </Card>

        <Card title="Tỉ Lệ Theo Độ Tuổi">
          <div className="space-y-3">
            <StatusItem label="6-12 tuổi" count="8%" color="bg-blue-500" />
            <StatusItem label="13-17 tuổi" count="12%" color="bg-indigo-500" />
            <StatusItem label="18-25 tuổi" count="15%" color="bg-purple-500" />
            <StatusItem label="26+ tuổi" count="10%" color="bg-pink-500" />
          </div>
        </Card>
      </div>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg shadow-md`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

/**
 * Status Item Component
 */
const StatusItem = ({ label, count, color }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{count}</span>
    </div>
  );
};

export default RetentionReportPage;
