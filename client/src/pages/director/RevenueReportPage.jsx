import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge } from "@components/common";
import { LineChart, BarChart } from "@components/charts";
import { reportService } from "@services";
import { formatCurrency, formatDate } from "@utils/date";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

/**
 * Revenue Report Page - Báo cáo doanh thu chi tiết
 */
const RevenueReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // day, week, month, quarter, year
  const [revenueData, setRevenueData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalExpenses: 0,
    growth: 0,
  });

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const [chartRes, statsRes] = await Promise.all([
        reportService.getRevenueChart({ period, limit: 12 }),
        reportService.getRevenueStats({ period }),
      ]);

      setRevenueData(chartRes.data || []);
      setStats(statsRes.data || stats);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export to CSV logic
    console.log("Exporting revenue report...");
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải báo cáo doanh thu..." />;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Báo Cáo Doanh Thu
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi doanh thu, chi phí và lợi nhuận
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Xuất Báo Cáo
        </button>
      </div>

      {/* Period Filter */}
      <Card>
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Chu kỳ:</span>
          <div className="flex gap-2">
            {["day", "week", "month", "quarter", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p === "day" && "Ngày"}
                {p === "week" && "Tuần"}
                {p === "month" && "Tháng"}
                {p === "quarter" && "Quý"}
                {p === "year" && "Năm"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-8 h-8" />}
          color="bg-blue-600"
          growth={stats.growth}
        />
        <StatCard
          title="Lợi Nhuận"
          value={formatCurrency(stats.totalProfit)}
          icon={<TrendingUp className="w-8 h-8" />}
          color="bg-green-600"
        />
        <StatCard
          title="Chi Phí"
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown className="w-8 h-8" />}
          color="bg-red-600"
        />
        <StatCard
          title="Tỷ Suất Lợi Nhuận"
          value={`${Math.round(
            (stats.totalProfit / stats.totalRevenue) * 100
          )}%`}
          icon={<Calendar className="w-8 h-8" />}
          color="bg-purple-600"
        />
      </div>

      {/* Revenue Chart */}
      <Card title="Biểu Đồ Doanh Thu Theo Thời Gian">
        <LineChart
          data={revenueData}
          lines={[
            {
              dataKey: "revenue",
              name: "Doanh thu",
              stroke: "#2563eb",
            },
            {
              dataKey: "profit",
              name: "Lợi nhuận",
              stroke: "#16a34a",
            },
            {
              dataKey: "expenses",
              name: "Chi phí",
              stroke: "#dc2626",
            },
          ]}
          height={400}
        />
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Phân Tích Doanh Thu Theo Nguồn">
          <BarChart
            data={[
              { name: "Học phí", value: stats.totalRevenue * 0.85 },
              { name: "Phí tài liệu", value: stats.totalRevenue * 0.1 },
              { name: "Khác", value: stats.totalRevenue * 0.05 },
            ]}
            bars={[
              {
                dataKey: "value",
                name: "Doanh thu",
                fill: "#2563eb",
              },
            ]}
            height={300}
          />
        </Card>

        <Card title="Chi Phí Hoạt Động">
          <BarChart
            data={[
              { name: "Lương GV", value: stats.totalExpenses * 0.5 },
              { name: "Lương NV", value: stats.totalExpenses * 0.25 },
              { name: "Cơ sở vật chất", value: stats.totalExpenses * 0.15 },
              { name: "Marketing", value: stats.totalExpenses * 0.1 },
            ]}
            bars={[
              {
                dataKey: "value",
                name: "Chi phí",
                fill: "#dc2626",
              },
            ]}
            height={300}
          />
        </Card>
      </div>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ title, value, icon, color, growth }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {growth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  growth >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {growth >= 0 ? "+" : ""}
                {growth}%
              </span>
              <span className="text-xs text-gray-500 ml-1">
                so với kỳ trước
              </span>
            </div>
          )}
        </div>
        <div className={`${color} text-white p-3 rounded-lg shadow-md`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default RevenueReportPage;
