import { useState, useEffect } from "react";
import { Card, Loading } from "@components/common";
import { LineChart, BarChart, DoughnutChart } from "@components/charts";
import { api } from "@services";

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrollmentTrends: [],
    coursePopularity: [],
    requestStats: {},
    studentStatus: {},
    monthlyComparison: [],
  });
  const [timeRange, setTimeRange] = useState("month"); // month, quarter, year

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/staff/enrollment/statistics?range=${timeRange}`
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Prepare chart data
  const enrollmentTrendData = {
    labels: stats.enrollmentTrends?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Số lượng ghi danh",
        data: stats.enrollmentTrends?.map((item) => item.count) || [],
        borderColor: "#3B9797",
        backgroundColor: "rgba(59, 151, 151, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const coursePopularityData = {
    labels: stats.coursePopularity?.map((item) => item.courseName) || [],
    datasets: [
      {
        label: "Số học viên",
        data: stats.coursePopularity?.map((item) => item.studentCount) || [],
        backgroundColor: [
          "#132440",
          "#16476A",
          "#3B9797",
          "#5AB9B9",
          "#7DD1D1",
        ],
      },
    ],
  };

  const studentStatusData = {
    labels: ["Đang học", "Bảo lưu", "Hoàn thành", "Nghỉ học"],
    datasets: [
      {
        data: [
          stats.studentStatus?.active || 0,
          stats.studentStatus?.paused || 0,
          stats.studentStatus?.completed || 0,
          stats.studentStatus?.dropped || 0,
        ],
        backgroundColor: ["#3B9797", "#F59E0B", "#10B981", "#EF4444"],
      },
    ],
  };

  const requestStatsData = {
    labels: ["Chuyển lớp", "Bảo lưu", "Tiếp tục học", "Nghỉ học"],
    datasets: [
      {
        label: "Đang chờ",
        data: [
          stats.requestStats?.transfer?.pending || 0,
          stats.requestStats?.pause?.pending || 0,
          stats.requestStats?.resume?.pending || 0,
          stats.requestStats?.dropout?.pending || 0,
        ],
        backgroundColor: "#F59E0B",
      },
      {
        label: "Đã duyệt",
        data: [
          stats.requestStats?.transfer?.approved || 0,
          stats.requestStats?.pause?.approved || 0,
          stats.requestStats?.resume?.approved || 0,
          stats.requestStats?.dropout?.approved || 0,
        ],
        backgroundColor: "#10B981",
      },
      {
        label: "Từ chối",
        data: [
          stats.requestStats?.transfer?.rejected || 0,
          stats.requestStats?.pause?.rejected || 0,
          stats.requestStats?.resume?.rejected || 0,
          stats.requestStats?.dropout?.rejected || 0,
        ],
        backgroundColor: "#EF4444",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#132440] to-[#16476A] bg-clip-text text-transparent">
            Thống Kê và Báo Cáo
          </h1>
          <p className="text-gray-600 mt-1">
            Phân tích dữ liệu ghi danh và hoạt động học viên
          </p>
        </div>

        {/* Time Range Filter */}
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B9797] focus:border-transparent"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="month">Tháng này</option>
          <option value="quarter">Quý này</option>
          <option value="year">Năm này</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng học viên</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalStudents || 0}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-green-600 font-semibold">
              +{stats.newStudentsThisMonth || 0}
            </span>
            <span className="text-gray-600"> trong tháng</span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đang học</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.studentStatus?.active || 0}
              </p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-600">
              {stats.studentStatus?.active
                ? (
                    (stats.studentStatus.active / stats.totalStudents) *
                    100
                  ).toFixed(1)
                : 0}
              % tổng số
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Yêu cầu chờ</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pendingRequests || 0}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-600">Cần xử lý</span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lớp hoạt động</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.activeClasses || 0}
              </p>
            </div>
            <div className="text-4xl">🏫</div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-600">
              {stats.averageClassSize || 0} học viên/lớp
            </span>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#132440] mb-4">
            📈 Xu Hướng Ghi Danh
          </h3>
          <LineChart data={enrollmentTrendData} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#132440] mb-4">
            📊 Độ Phổ Biến Khóa Học
          </h3>
          <BarChart data={coursePopularityData} />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#132440] mb-4">
            🎯 Phân Bố Trạng Thái Học Viên
          </h3>
          <DoughnutChart data={studentStatusData} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#132440] mb-4">
            📋 Thống Kê Yêu Cầu
          </h3>
          <BarChart data={requestStatsData} />
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#132440] mb-4">
          📑 Chi Tiết Thống Kê
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#132440] to-[#16476A] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Chỉ số</th>
                <th className="px-4 py-3 text-right">Giá trị</th>
                <th className="px-4 py-3 text-right">So với tháng trước</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">Số lượng ghi danh mới</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {stats.newEnrollments || 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      stats.enrollmentChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stats.enrollmentChange >= 0 ? "+" : ""}
                    {stats.enrollmentChange || 0}%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">Tỷ lệ giữ chân học viên</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {stats.retentionRate || 0}%
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      stats.retentionChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stats.retentionChange >= 0 ? "+" : ""}
                    {stats.retentionChange || 0}%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  Thời gian xử lý yêu cầu trung bình
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {stats.avgRequestProcessingTime || 0} giờ
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      stats.processingTimeChange <= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stats.processingTimeChange <= 0 ? "" : "+"}
                    {stats.processingTimeChange || 0} giờ
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">Tỷ lệ lấp đầy lớp học</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {stats.classCapacityRate || 0}%
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      stats.capacityRateChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stats.capacityRateChange >= 0 ? "+" : ""}
                    {stats.capacityRateChange || 0}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StatisticsPage;
