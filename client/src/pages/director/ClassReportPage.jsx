import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { BarChart, PieChart } from "@components/charts";
import { reportService } from "@services";
import {
  School,
  Users,
  DoorOpen,
  DoorClosed,
  TrendingUp,
  Calendar,
} from "lucide-react";

/**
 * Class Report Page - Thống kê lớp học
 */
const ClassReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    openClasses: 0,
    closedClasses: 0,
    avgStudentsPerClass: 0,
  });
  const [classData, setClassData] = useState([]);
  const [capacityData, setCapacityData] = useState([]);
  const [classList, setClassList] = useState([]);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const [statsRes, classDataRes, capacityRes, classListRes] =
        await Promise.all([
          reportService.getClassStats(),
          reportService.getClassesByStatus(),
          reportService.getClassCapacity(),
          reportService.getAllClasses({ limit: 20 }),
        ]);

      setStats(statsRes.data || stats);
      setClassData(classDataRes.data || []);
      setCapacityData(capacityRes.data || []);

      // Handle classList - ensure it's always an array
      const classListData =
        classListRes?.data?.data || classListRes?.data || [];
      setClassList(Array.isArray(classListData) ? classListData : []);
    } catch (error) {
      console.error("Error fetching class data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải thống kê lớp học..." />;
  }

  const tableColumns = [
    { key: "classCode", label: "Mã Lớp" },
    { key: "className", label: "Tên Lớp" },
    { key: "course", label: "Khóa Học" },
    { key: "teacher", label: "Giảng Viên" },
    { key: "students", label: "Sĩ Số" },
    { key: "capacity", label: "Tỷ Lệ Lấp Đầy" },
    { key: "status", label: "Trạng Thái" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống Kê Lớp Học</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi sĩ số và tình trạng lớp học
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Tổng Lớp Học"
          value={stats.totalClasses}
          icon={<School className="w-8 h-8" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Đang Hoạt Động"
          value={stats.activeClasses}
          icon={<DoorOpen className="w-8 h-8" />}
          color="bg-green-600"
        />
        <StatCard
          title="Lớp Mở"
          value={stats.openClasses}
          icon={<Users className="w-8 h-8" />}
          color="bg-purple-600"
          subtitle="Còn chỗ trống"
        />
        <StatCard
          title="Lớp Đóng"
          value={stats.closedClasses}
          icon={<DoorClosed className="w-8 h-8" />}
          color="bg-orange-600"
          subtitle="Đã đủ sĩ số"
        />
        <StatCard
          title="TB HV/Lớp"
          value={stats.avgStudentsPerClass}
          icon={<TrendingUp className="w-8 h-8" />}
          color="bg-teal-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Status Distribution */}
        <Card title="Phân Bổ Trạng Thái Lớp Học">
          <PieChart
            data={classData}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </Card>

        {/* Capacity Analysis */}
        <Card title="Phân Tích Tỷ Lệ Lấp Đầy">
          <BarChart
            data={capacityData}
            bars={[
              {
                dataKey: "capacity",
                name: "Tỷ lệ lấp đầy",
                fill: "#2563eb",
              },
            ]}
            height={300}
          />
        </Card>
      </div>

      {/* Class List Table */}
      <Card title="Danh Sách Lớp Học">
        <Table
          columns={tableColumns}
          data={classList.map((cls) => ({
            classCode: cls.classCode,
            className: cls.className,
            course: cls.course?.name || "N/A",
            teacher: cls.teacher?.fullName || "Chưa phân công",
            students: `${cls.currentStudents}/${cls.maxStudents}`,
            capacity: (
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      cls.capacityPercent >= 90
                        ? "bg-red-500"
                        : cls.capacityPercent >= 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${cls.capacityPercent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {cls.capacityPercent}%
                </span>
              </div>
            ),
            status: (
              <Badge
                variant={
                  cls.status === "active"
                    ? "success"
                    : cls.status === "full"
                    ? "warning"
                    : "default"
                }
              >
                {cls.status === "active"
                  ? "Hoạt động"
                  : cls.status === "full"
                  ? "Đã đủ"
                  : "Đóng"}
              </Badge>
            ),
          }))}
        />
      </Card>

      {/* Class Statistics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Phân Bổ Theo Trình Độ">
          <div className="space-y-3">
            <StatusItem label="Beginner" count={15} color="bg-blue-500" />
            <StatusItem label="Elementary" count={12} color="bg-indigo-500" />
            <StatusItem label="Intermediate" count={10} color="bg-purple-500" />
            <StatusItem label="Advanced" count={8} color="bg-pink-500" />
          </div>
        </Card>

        <Card title="Phân Bổ Theo Khung Giờ">
          <div className="space-y-3">
            <StatusItem
              label="Buổi Sáng (7-12h)"
              count={18}
              color="bg-yellow-500"
            />
            <StatusItem
              label="Buổi Chiều (13-17h)"
              count={12}
              color="bg-orange-500"
            />
            <StatusItem
              label="Buổi Tối (18-21h)"
              count={15}
              color="bg-blue-500"
            />
          </div>
        </Card>

        <Card title="Lớp Theo Ngày Trong Tuần">
          <div className="space-y-3">
            <StatusItem label="Thứ 2, 4, 6" count={20} color="bg-green-500" />
            <StatusItem label="Thứ 3, 5, 7" count={18} color="bg-teal-500" />
            <StatusItem label="Cuối tuần" count={7} color="bg-purple-500" />
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
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
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

export default ClassReportPage;
