import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { LineChart, PieChart } from "@components/charts";
import { reportService } from "@services";
import { formatDate } from "@utils/date";
import {
  Users,
  UserPlus,
  TrendingUp,
  GraduationCap,
  Award,
} from "lucide-react";

/**
 * Student Report Page - Thống kê học viên
 */
const StudentReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newStudents: 0,
    graduatedStudents: 0,
    growth: 0,
  });
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [statsRes, enrollmentRes, distributionRes, topStudentsRes] =
        await Promise.all([
          reportService.getStudentStats(),
          reportService.getEnrollmentTrend({ limit: 12 }),
          reportService.getStudentDistribution(),
          reportService.getTopStudents({ limit: 10 }),
        ]);

      setStats(statsRes.data || stats);
      setEnrollmentData(enrollmentRes.data || []);
      setDistributionData(distributionRes.data || []);
      setTopStudents(topStudentsRes.data || []);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải thống kê học viên..." />;
  }

  const tableColumns = [
    { key: "rank", label: "Hạng", width: "60px" },
    { key: "studentCode", label: "Mã HV" },
    { key: "fullName", label: "Họ và Tên" },
    { key: "course", label: "Khóa học" },
    { key: "gpa", label: "GPA" },
    { key: "attendance", label: "Chuyên cần" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Thống Kê Học Viên
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi số lượng học viên và xu hướng ghi danh
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Học Viên"
          value={stats.totalStudents}
          icon={<Users className="w-8 h-8" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Đang Học"
          value={stats.activeStudents}
          icon={<GraduationCap className="w-8 h-8" />}
          color="bg-green-600"
        />
        <StatCard
          title="Ghi Danh Mới"
          value={stats.newStudents}
          icon={<UserPlus className="w-8 h-8" />}
          color="bg-purple-600"
          subtitle={
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                +{stats.growth}%
              </span>
              <span className="text-xs text-gray-500 ml-1">
                so với tháng trước
              </span>
            </div>
          }
        />
        <StatCard
          title="Đã Tốt Nghiệp"
          value={stats.graduatedStudents}
          icon={<Award className="w-8 h-8" />}
          color="bg-yellow-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Trend */}
        <Card title="Xu Hướng Ghi Danh" className="lg:col-span-2">
          <LineChart
            data={enrollmentData}
            lines={[
              {
                dataKey: "newStudents",
                name: "Học viên mới",
                stroke: "#2563eb",
              },
              {
                dataKey: "activeStudents",
                name: "Đang học",
                stroke: "#16a34a",
              },
            ]}
            height={300}
          />
        </Card>

        {/* Student Distribution */}
        <Card title="Phân Bổ Theo Khóa Học">
          <PieChart
            data={distributionData}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </Card>
      </div>

      {/* Top Students Table */}
      <Card title="Top 10 Học Viên Xuất Sắc">
        <Table
          columns={tableColumns}
          data={topStudents.map((student, index) => ({
            rank: (
              <div className="flex items-center justify-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-yellow-400 text-white"
                      : index === 1
                      ? "bg-gray-300 text-gray-700"
                      : index === 2
                      ? "bg-orange-400 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {index + 1}
                </span>
              </div>
            ),
            studentCode: student.studentCode,
            fullName: student.fullName,
            course: student.course,
            gpa: (
              <span className="font-semibold text-blue-600">{student.gpa}</span>
            ),
            attendance: (
              <Badge variant={student.attendance >= 90 ? "success" : "warning"}>
                {student.attendance}%
              </Badge>
            ),
          }))}
        />
      </Card>

      {/* Student Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Trạng Thái Học Viên">
          <div className="space-y-3">
            <StatusItem
              label="Đang học"
              count={stats.activeStudents}
              color="bg-green-500"
            />
            <StatusItem label="Tạm nghỉ" count={25} color="bg-yellow-500" />
            <StatusItem label="Bảo lưu" count={12} color="bg-orange-500" />
            <StatusItem label="Đã nghỉ" count={8} color="bg-red-500" />
          </div>
        </Card>

        <Card title="Phân Bổ Theo Trình Độ">
          <div className="space-y-3">
            <StatusItem label="Beginner" count={120} color="bg-blue-500" />
            <StatusItem label="Elementary" count={95} color="bg-indigo-500" />
            <StatusItem label="Intermediate" count={80} color="bg-purple-500" />
            <StatusItem label="Advanced" count={45} color="bg-pink-500" />
          </div>
        </Card>

        <Card title="Phân Bổ Theo Độ Tuổi">
          <div className="space-y-3">
            <StatusItem label="6-12 tuổi" count={85} color="bg-cyan-500" />
            <StatusItem label="13-17 tuổi" count={110} color="bg-teal-500" />
            <StatusItem label="18-25 tuổi" count={95} color="bg-emerald-500" />
            <StatusItem label="26+ tuổi" count={50} color="bg-lime-500" />
          </div>
        </Card>
      </div>
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
          {subtitle && <div className="mt-1">{subtitle}</div>}
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

export default StudentReportPage;
