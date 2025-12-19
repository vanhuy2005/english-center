import { useState, useEffect } from "react";
import api from "@services/api";
import { Card, Loading } from "@components/common";
import { TrendingUp, BarChart3 } from "lucide-react";
import { LineChart, BarChart as BarChartComponent } from "@components/charts";

const RevenueReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    summary: {},
    revenueChart: { labels: [], datasets: [] },
    receiptSummary: [],
  });
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    groupBy: "month",
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/accountant/reports/financial", {
        params: filters,
      });
      if (response.data.success) {
        const data = response.data.data;
        const totalRevenue = data.summary?.totalRevenue || 0;
        const totalRefunds = data.summary?.totalRefunds || 0;
        const netRevenue = data.summary?.netRevenue || 0;

        // Transform data to match expected format
        const transformedData = {
          summary: {
            totalRevenue,
            totalRefunds,
            netRevenue,
            receiptCount: data.summary?.totalTransactions || 0,
          },
          revenueChart: {
            labels: (data.revenueByType || []).map(
              (item) => item._id || "Unknown"
            ),
            datasets: [
              {
                label: "Doanh Thu",
                data: (data.revenueByType || []).map((item) => item.total || 0),
                backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
              },
            ],
          },
          summaryChart: {
            labels: ["Tổng Doanh Thu", "Hoàn Tiền", "Doanh Thu Ròng"],
            datasets: [
              {
                label: "Số Tiền (VND)",
                data: [totalRevenue, totalRefunds, netRevenue],
                backgroundColor: ["#10b981", "#ef4444", "#3b82f6"],
                borderColor: ["#059669", "#dc2626", "#1d4ed8"],
                borderWidth: 2,
              },
            ],
          },
        };

        setReportData(transformedData);
      } else {
        setReportData({
          summary: {
            totalRevenue: 0,
            totalRefunds: 0,
            netRevenue: 0,
            receiptCount: 0,
          },
          revenueChart: { labels: [], datasets: [] },
          receiptSummary: [],
          summaryChart: {
            labels: ["Tổng Doanh Thu", "Hoàn Tiền", "Doanh Thu Ròng"],
            datasets: [
              {
                label: "Số Tiền (VND)",
                data: [0, 0, 0],
                backgroundColor: ["#10b981", "#ef4444", "#3b82f6"],
                borderColor: ["#059669", "#dc2626", "#1d4ed8"],
                borderWidth: 2,
              },
            ],
          },
        });
      }
    } catch (error) {
      console.error("Error loading report:", error);
      setReportData({
        summary: {
          totalRevenue: 0,
          totalRefunds: 0,
          netRevenue: 0,
          receiptCount: 0,
        },
        revenueChart: { labels: [], datasets: [] },
        receiptSummary: [],
        summaryChart: {
          labels: ["Tổng Doanh Thu", "Hoàn Tiền", "Doanh Thu Ròng"],
          datasets: [
            {
              label: "Số Tiền (VND)",
              data: [0, 0, 0],
              backgroundColor: ["#10b981", "#ef4444", "#3b82f6"],
              borderColor: ["#059669", "#dc2626", "#1d4ed8"],
              borderWidth: 2,
            },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="text-green-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Báo Cáo Doanh Thu
          </h1>
          <p className="text-gray-600 mt-1">
            Phân tích doanh thu theo thời gian
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50">
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">Tổng Doanh Thu</p>
            <p className="text-xl font-bold text-green-900 mt-1">
              {formatCurrency(reportData.summary.totalRevenue || 0)}
            </p>
          </div>
        </Card>
        <Card className="bg-red-50">
          <div className="text-center">
            <p className="text-sm text-red-600 font-medium">Hoàn Tiền</p>
            <p className="text-xl font-bold text-red-900 mt-1">
              {formatCurrency(reportData.summary.totalRefunds || 0)}
            </p>
          </div>
        </Card>
        <Card className="bg-blue-50">
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Doanh Thu Ròng</p>
            <p className="text-xl font-bold text-blue-900 mt-1">
              {formatCurrency(reportData.summary.netRevenue || 0)}
            </p>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="text-center">
            <p className="text-sm text-purple-600 font-medium">Số Giao Dịch</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {reportData.summary.receiptCount || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Summary Comparison Chart */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">
            So Sánh Doanh Thu - Hoàn Tiền - Doanh Thu Ròng
          </h3>
        </div>
        <BarChartComponent data={reportData.summaryChart} height={300} />
      </Card>

      {/* Summary Table */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Thống Kê Tổng Hợp
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-sm text-gray-600 mb-1">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(reportData.summary.totalRevenue || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {reportData.summary.receiptCount || 0} giao dịch
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4 py-2">
            <p className="text-sm text-gray-600 mb-1">Hoàn Tiền</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(reportData.summary.totalRefunds || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {reportData.summary.totalRefunds > 0
                ? (
                    (reportData.summary.totalRefunds /
                      reportData.summary.totalRevenue) *
                    100
                  ).toFixed(2)
                : 0}
              % tổng doanh thu
            </p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-sm text-gray-600 mb-1">Doanh Thu Ròng</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(reportData.summary.netRevenue || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {reportData.summary.netRevenue > 0
                ? (
                    (reportData.summary.netRevenue /
                      reportData.summary.totalRevenue) *
                    100
                  ).toFixed(2)
                : 0}
              % tổng doanh thu
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhóm theo
            </label>
            <select
              value={filters.groupBy}
              onChange={(e) =>
                setFilters({ ...filters, groupBy: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">
            Biểu Đồ Doanh Thu
          </h3>
        </div>
        <BarChartComponent data={reportData.revenueChart} height={400} />
      </Card>

      {/* Receipt Summary Table */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Tổng Kết Doanh Thu Theo Phiếu Thu
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Chi tiết doanh thu của từng loại phiếu thu
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Loại Phiếu Thu
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Số Lượng
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Tổng Doanh Thu
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Trung Bình
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.revenueChart?.labels?.length > 0 ? (
                reportData.revenueChart.labels.map((label, idx) => {
                  const total =
                    reportData.revenueChart.datasets[0]?.data?.[idx] || 0;
                  const count = reportData.summary?.receiptCount || 0;
                  const average = count > 0 ? total / count : 0;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {label}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {count}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-semibold">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatCurrency(average)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RevenueReportsPage;
