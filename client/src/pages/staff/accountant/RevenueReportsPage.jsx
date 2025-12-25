import { useState, useEffect } from "react";
import api from "@services/api";
import { Card, Loading, Button } from "@components/common";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Filter,
  Download,
  DollarSign,
  RefreshCw,
  FileText,
} from "lucide-react";
import { LineChart, BarChart as BarChartComponent } from "@components/charts";

const RevenueReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    summary: {},
    revenueChart: { labels: [], datasets: [] },
    receiptSummary: [],
    summaryChart: { labels: [], datasets: [] }, // Ensure this is initialized
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
      // Map frontend filter keys to backend expectations (startDate/endDate)
      const params = {
        startDate: filters.dateFrom || undefined,
        endDate: filters.dateTo || undefined,
        groupBy: filters.groupBy,
      };

      const response = await api.get("/staff/accountant/reports/financial", {
        params,
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
                borderRadius: 4,
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
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
        };

        setReportData(transformedData);
      } else {
        // Handle case where success is false but no error thrown
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
                borderWidth: 1,
              },
            ],
          },
        });
      }
    } catch (error) {
      console.error("Error loading report:", error);
      // Set empty state on error
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
              borderWidth: 1,
            },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Export report to Excel (calls server endpoint which returns an HTML xls)
  const exportReportFile = async () => {
    try {
      const payload = {
        reportType: "revenue",
        dateFrom: filters.dateFrom || "",
        dateTo: filters.dateTo || "",
      };
      const resp = await api.post("/staff/accountant/reports/export", payload, {
        responseType: "blob",
      });

      // Construct blob and trigger download
      const blob = new Blob([resp.data], {
        type: resp.headers["content-type"] || "application/vnd.ms-excel",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Try to read filename from Content-Disposition header
      const disposition = resp.headers["content-disposition"];
      let filename = `bao_cao_revenue_${Date.now()}.xls`;
      if (disposition) {
        const match = /filename="(.+)"/.exec(disposition);
        if (match && match[1]) filename = match[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export report error:", err);
      // Optionally show a toast or UI message here
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    subtext,
    icon: Icon,
    colorClass,
    bgClass,
  }) => (
    <div
      className={`p-6 rounded-xl border border-gray-100 shadow-sm ${bgClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-medium mb-1 ${colorClass}`}>{title}</p>
          <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
          {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-white/60 ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Báo Cáo Doanh Thu
            </h1>
            <p className="text-sm text-gray-500">
              Phân tích hiệu quả kinh doanh theo thời gian thực
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadReport}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} /> Làm mới
          </Button>
          <Button
            onClick={exportReportFile}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download size={16} /> Xuất Báo Cáo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-end gap-4 p-1">
          <div className="w-full md:w-1/4">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar size={14} /> Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="w-full md:w-1/4">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar size={14} /> Đến ngày
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="w-full md:w-1/4">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Filter size={14} /> Nhóm theo
            </label>
            <select
              value={filters.groupBy}
              onChange={(e) =>
                setFilters({ ...filters, groupBy: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          </div>
          <div className="w-full md:w-auto pb-0.5">
            <Button
              onClick={loadReport}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(reportData.summary.totalRevenue || 0)}
          subtext="Doanh thu gộp trước hoàn tiền"
          icon={DollarSign}
          colorClass="text-emerald-600"
          bgClass="bg-white hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Hoàn Tiền"
          value={formatCurrency(reportData.summary.totalRefunds || 0)}
          subtext="Tổng số tiền đã hoàn trả"
          icon={RefreshCw}
          colorClass="text-rose-600"
          bgClass="bg-white hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Doanh Thu Ròng"
          value={formatCurrency(reportData.summary.netRevenue || 0)}
          subtext="Lợi nhuận thực tế"
          icon={TrendingUp}
          colorClass="text-indigo-600"
          bgClass="bg-white hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Tổng Giao Dịch"
          value={reportData.summary.receiptCount || 0}
          subtext="Số lượng phiếu thu phát sinh"
          icon={FileText}
          colorClass="text-amber-600"
          bgClass="bg-white hover:shadow-md transition-shadow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-emerald-600" size={20} />
              <h3 className="font-bold text-gray-800">
                Biểu Đồ Phân Bố Doanh Thu
              </h3>
            </div>
          </div>
          <div className="p-4">
            <BarChartComponent data={reportData.revenueChart} height={350} />
          </div>
        </Card>

        {/* Comparison Chart */}
        <Card className="border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} />
              <h3 className="font-bold text-gray-800">Tổng Quan Tài Chính</h3>
            </div>
          </div>
          <div className="p-4">
            <BarChartComponent data={reportData.summaryChart} height={350} />
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">
            Chi Tiết Doanh Thu Theo Loại
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Phân tích chi tiết nguồn thu nhập
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Loại Phiếu Thu</th>
                <th className="px-6 py-4 text-right">Số Lượng Giao Dịch</th>
                <th className="px-6 py-4 text-right">Tổng Doanh Thu</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">
                  Giá Trị Trung Bình
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.revenueChart?.labels?.length > 0 ? (
                reportData.revenueChart.labels.map((label, idx) => {
                  const total =
                    reportData.revenueChart.datasets[0]?.data?.[idx] || 0;
                  // Note: receiptCount is total, ideally we need count per type from backend
                  // Assuming for now receiptCount applies generally or calculating avg based on available data
                  // Ideally: backend sends array of { type, count, total }
                  // Fallback to simple calculation for demo if detail count missing
                  const count = 1; // Placeholder if specific count per type isn't in chart data
                  const average = count > 0 ? total / count : 0;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                        {label === "tuition"
                          ? "Học phí"
                          : label === "material"
                          ? "Tài liệu"
                          : label}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {/* Placeholder count display - enhance if backend provides specific counts */}
                        -
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {/* Placeholder avg */}-
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-gray-400 italic"
                  >
                    Chưa có dữ liệu thống kê
                  </td>
                </tr>
              )}
            </tbody>
            {reportData.summary.totalRevenue > 0 && (
              <tfoot className="bg-gray-50 font-bold text-gray-900 border-t border-gray-200">
                <tr>
                  <td className="px-6 py-4">Tổng cộng</td>
                  <td className="px-6 py-4 text-right">
                    {reportData.summary.receiptCount}
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-700">
                    {formatCurrency(reportData.summary.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 text-right">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RevenueReportsPage;
