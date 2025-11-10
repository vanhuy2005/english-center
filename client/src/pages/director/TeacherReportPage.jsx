import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { BarChart, LineChart } from "@components/charts";
import { reportService } from "@services";
import {
  GraduationCap,
  Users,
  Award,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";

/**
 * Teacher Report Page - Hiệu suất giảng viên
 */
const TeacherReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    activeTeachers: 0,
    avgRating: 0,
    avgClassesPerTeacher: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const [statsRes, performanceRes, teacherListRes, ratingRes] =
        await Promise.all([
          reportService.getTeacherStats(),
          reportService.getTeacherPerformance({ limit: 12 }),
          reportService.getTopTeachers({ limit: 15 }),
          reportService.getTeacherRatingDistribution(),
        ]);

      setStats(statsRes.data || stats);
      setPerformanceData(performanceRes.data || []);
      setTeacherList(teacherListRes.data || []);
      setRatingDistribution(ratingRes.data || []);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải báo cáo giảng viên..." />;
  }

  const tableColumns = [
    { key: "rank", label: "Hạng", width: "60px" },
    { key: "teacherCode", label: "Mã GV" },
    { key: "fullName", label: "Họ và Tên" },
    { key: "classes", label: "Số Lớp" },
    { key: "students", label: "Số HV" },
    { key: "rating", label: "Đánh Giá" },
    { key: "attendance", label: "Chuyên Cần" },
    { key: "performance", label: "Hiệu Suất" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hiệu Suất Giảng Viên
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và đánh giá hiệu suất giảng dạy
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Giảng Viên"
          value={stats.totalTeachers}
          icon={<GraduationCap className="w-8 h-8" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Đang Giảng Dạy"
          value={stats.activeTeachers}
          icon={<Users className="w-8 h-8" />}
          color="bg-green-600"
        />
        <StatCard
          title="Đánh Giá TB"
          value={`${stats.avgRating}/5`}
          icon={<Star className="w-8 h-8" />}
          color="bg-yellow-600"
        />
        <StatCard
          title="TB Lớp/GV"
          value={stats.avgClassesPerTeacher}
          icon={<Award className="w-8 h-8" />}
          color="bg-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card title="Xu Hướng Hiệu Suất Giảng Dạy">
          <LineChart
            data={performanceData}
            lines={[
              {
                dataKey: "avgRating",
                name: "Đánh giá TB",
                stroke: "#2563eb",
              },
              {
                dataKey: "attendance",
                name: "Chuyên cần",
                stroke: "#16a34a",
              },
            ]}
            height={300}
          />
        </Card>

        {/* Rating Distribution */}
        <Card title="Phân Bổ Đánh Giá">
          <BarChart
            data={ratingDistribution}
            bars={[
              {
                dataKey: "count",
                name: "Số lượng",
                fill: "#eab308",
              },
            ]}
            height={300}
          />
        </Card>
      </div>

      {/* Top Teachers Table */}
      <Card title="Top Giảng Viên Xuất Sắc">
        <Table
          columns={tableColumns}
          data={teacherList.map((teacher, index) => ({
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
            teacherCode: teacher.teacherCode,
            fullName: teacher.fullName,
            classes: teacher.totalClasses,
            students: teacher.totalStudents,
            rating: (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-900">
                  {teacher.rating}
                </span>
              </div>
            ),
            attendance: (
              <Badge variant={teacher.attendance >= 95 ? "success" : "warning"}>
                {teacher.attendance}%
              </Badge>
            ),
            performance: (
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      teacher.performance >= 90
                        ? "bg-green-500"
                        : teacher.performance >= 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${teacher.performance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {teacher.performance}%
                </span>
              </div>
            ),
          }))}
        />
      </Card>

      {/* Teacher Statistics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Phân Bổ Theo Chuyên Môn">
          <div className="space-y-3">
            <StatusItem label="Giao tiếp" count={12} color="bg-blue-500" />
            <StatusItem label="IELTS/TOEIC" count={10} color="bg-indigo-500" />
            <StatusItem label="Thiếu nhi" count={8} color="bg-purple-500" />
            <StatusItem label="Doanh nghiệp" count={5} color="bg-pink-500" />
          </div>
        </Card>

        <Card title="Thâm Niên Công Tác">
          <div className="space-y-3">
            <StatusItem label="< 1 năm" count={8} color="bg-gray-500" />
            <StatusItem label="1-3 năm" count={12} color="bg-blue-500" />
            <StatusItem label="3-5 năm" count={10} color="bg-green-500" />
            <StatusItem label="> 5 năm" count={5} color="bg-purple-500" />
          </div>
        </Card>

        <Card title="Khối Lượng Công Việc">
          <div className="space-y-3">
            <StatusItem label="< 3 lớp" count={5} color="bg-green-500" />
            <StatusItem label="3-5 lớp" count={18} color="bg-yellow-500" />
            <StatusItem label="5-8 lớp" count={10} color="bg-orange-500" />
            <StatusItem label="> 8 lớp" count={2} color="bg-red-500" />
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

export default TeacherReportPage;
