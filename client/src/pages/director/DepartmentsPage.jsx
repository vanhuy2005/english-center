import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge } from "@components/common";
import { BarChart } from "@components/charts";
import { reportService } from "@services";
import {
  Building2,
  Users,
  ClipboardList,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

/**
 * Departments Page - Tổng quan hoạt động các bộ phận
 */
const DepartmentsPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [enrollmentDept, setEnrollmentDept] = useState({
    newEnrollments: 0,
    pendingApplications: 0,
    completionRate: 0,
    status: "good",
  });
  const [academicDept, setAcademicDept] = useState({
    activeClasses: 0,
    avgAttendance: 0,
    pendingRequests: 0,
    status: "good",
  });
  const [accountingDept, setAccountingDept] = useState({
    collectionRate: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    status: "good",
  });
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const [enrollmentRes, academicRes, accountingRes, performanceRes] =
        await Promise.all([
          reportService.getEnrollmentDepartment(),
          reportService.getAcademicDepartment(),
          reportService.getAccountingDepartment(),
          reportService.getDepartmentPerformance({ limit: 6 }),
        ]);

      setEnrollmentDept(enrollmentRes.data || enrollmentDept);
      setAcademicDept(academicRes.data || academicDept);
      setAccountingDept(accountingRes.data || accountingDept);
      setPerformanceData(performanceRes.data || []);
    } catch (error) {
      console.error("Error fetching department data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải thông tin bộ phận..." />;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tổng Quan Bộ Phận
          </h1>
          <p className="text-gray-600 mt-1">
            Hoạt động của các bộ phận Ghi danh, Học vụ, Kế toán
          </p>
        </div>
        <button
          onClick={fetchDepartmentData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Làm Mới
        </button>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Department */}
        <DepartmentCard
          title="Phòng Ghi Danh"
          icon={<Users className="w-8 h-8" />}
          color="bg-blue-600"
          status={enrollmentDept.status}
        >
          <div className="space-y-4">
            <MetricRow
              label="Ghi danh mới (tháng này)"
              value={enrollmentDept.newEnrollments}
              icon={<UserPlus className="w-5 h-5 text-green-500" />}
            />
            <MetricRow
              label="Đơn đăng ký chờ xử lý"
              value={enrollmentDept.pendingApplications}
              icon={<ClipboardList className="w-5 h-5 text-orange-500" />}
            />
            <MetricRow
              label="Tỉ lệ hoàn thành"
              value={`${enrollmentDept.completionRate}%`}
              icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
            />
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Hiệu suất tổng thể</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${enrollmentDept.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {enrollmentDept.completionRate}%
                </span>
              </div>
            </div>
          </div>
        </DepartmentCard>

        {/* Academic Department */}
        <DepartmentCard
          title="Phòng Học Vụ"
          icon={<ClipboardList className="w-8 h-8" />}
          color="bg-green-600"
          status={academicDept.status}
        >
          <div className="space-y-4">
            <MetricRow
              label="Lớp đang hoạt động"
              value={academicDept.activeClasses}
              icon={<Building2 className="w-5 h-5 text-blue-500" />}
            />
            <MetricRow
              label="Chuyên cần trung bình"
              value={`${academicDept.avgAttendance}%`}
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            />
            <MetricRow
              label="Yêu cầu chờ xử lý"
              value={academicDept.pendingRequests}
              icon={<AlertCircle className="w-5 h-5 text-orange-500" />}
            />
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Hiệu suất tổng thể</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${academicDept.avgAttendance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {academicDept.avgAttendance}%
                </span>
              </div>
            </div>
          </div>
        </DepartmentCard>

        {/* Accounting Department */}
        <DepartmentCard
          title="Phòng Kế Toán"
          icon={<DollarSign className="w-8 h-8" />}
          color="bg-purple-600"
          status={accountingDept.status}
        >
          <div className="space-y-4">
            <MetricRow
              label="Doanh thu tháng này"
              value={`${(accountingDept.monthlyRevenue / 1000000).toFixed(1)}M`}
              icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            />
            <MetricRow
              label="Khoản thanh toán chờ"
              value={accountingDept.pendingPayments}
              icon={<AlertCircle className="w-5 h-5 text-orange-500" />}
            />
            <MetricRow
              label="Tỉ lệ thu tiền"
              value={`${accountingDept.collectionRate}%`}
              icon={<CheckCircle className="w-5 h-5 text-blue-500" />}
            />
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Hiệu suất tổng thể</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      accountingDept.collectionRate >= 90
                        ? "bg-green-500"
                        : accountingDept.collectionRate >= 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${accountingDept.collectionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {accountingDept.collectionRate}%
                </span>
              </div>
            </div>
          </div>
        </DepartmentCard>
      </div>

      {/* Performance Comparison Chart */}
      <Card title="So Sánh Hiệu Suất Các Bộ Phận">
        <BarChart
          data={performanceData}
          bars={[
            {
              dataKey: "enrollment",
              name: "Ghi danh",
              fill: "#2563eb",
            },
            {
              dataKey: "academic",
              name: "Học vụ",
              fill: "#16a34a",
            },
            {
              dataKey: "accounting",
              name: "Kế toán",
              fill: "#9333ea",
            },
          ]}
          height={400}
        />
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Chỉ Số Hiệu Suất Chính (KPI)">
          <div className="space-y-3">
            <KPIRow
              label="Tỉ lệ chuyển đổi đăng ký"
              target={80}
              actual={enrollmentDept.completionRate}
            />
            <KPIRow
              label="Chuyên cần học viên"
              target={85}
              actual={academicDept.avgAttendance}
            />
            <KPIRow
              label="Tỉ lệ thu tiền đúng hạn"
              target={90}
              actual={accountingDept.collectionRate}
            />
            <KPIRow label="Thời gian xử lý yêu cầu" target={100} actual={75} />
          </div>
        </Card>

        <Card title="Cảnh Báo & Khuyến Nghị">
          <div className="space-y-3">
            {accountingDept.pendingPayments > 10 && (
              <AlertItem
                type="warning"
                message={`${accountingDept.pendingPayments} khoản thanh toán chờ xử lý`}
                action="Cần xử lý ngay"
              />
            )}
            {academicDept.pendingRequests > 5 && (
              <AlertItem
                type="warning"
                message={`${academicDept.pendingRequests} yêu cầu học vụ chưa duyệt`}
                action="Cần duyệt trong 24h"
              />
            )}
            {enrollmentDept.pendingApplications > 8 && (
              <AlertItem
                type="warning"
                message={`${enrollmentDept.pendingApplications} đơn đăng ký chờ liên hệ`}
                action="Liên hệ trong hôm nay"
              />
            )}
            {accountingDept.collectionRate < 85 && (
              <AlertItem
                type="danger"
                message="Tỉ lệ thu tiền thấp hơn mục tiêu"
                action="Cần tăng cường nhắc nợ"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

/**
 * Department Card Component
 */
const DepartmentCard = ({ title, icon, color, status, children }) => {
  const statusColors = {
    good: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${color} text-white p-3 rounded-lg shadow-md`}>
              {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <Badge className={statusColors[status]}>
            {status === "good"
              ? "Tốt"
              : status === "warning"
              ? "Cảnh báo"
              : "Chú ý"}
          </Badge>
        </div>
        {children}
      </div>
    </Card>
  );
};

/**
 * Metric Row Component
 */
const MetricRow = ({ label, value, icon }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
};

/**
 * KPI Row Component
 */
const KPIRow = ({ label, target, actual }) => {
  const percentage = (actual / target) * 100;
  const status =
    percentage >= 90 ? "success" : percentage >= 70 ? "warning" : "danger";

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">
          {actual}% / {target}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              status === "success"
                ? "bg-green-500"
                : status === "warning"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-600">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

/**
 * Alert Item Component
 */
const AlertItem = ({ type, message, action }) => {
  const colors = {
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[type]}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
          <p className="text-xs mt-1 opacity-80">{action}</p>
        </div>
      </div>
    </div>
  );
};

const UserPlus = ({ className }) => <Users className={className} />;

export default DepartmentsPage;
