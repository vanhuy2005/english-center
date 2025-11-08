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
  });
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    groupBy: "month",
  });

  useEffect(() => {
    loadReport();
  }, [filters]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/accountant/reports/revenue", {
        params: filters,
      });
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
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
    </div>
  );
};

export default RevenueReportsPage;
