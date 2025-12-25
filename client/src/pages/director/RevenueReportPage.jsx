import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { LineChart, BarChart, PieChart } from "@components/charts"; // Chart.js wrappers expect {labels,datasets}
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  PieChart as PieIcon,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { directorService } from "@services/directorService";
import toast from "react-hot-toast";

// Import mock data for fallback or sources/expenses (if not available from API)
import {
  revenueSourceData,
  expenseBreakdownData,
  recentTransactions,
} from "./mockRevenueData";

const RevenueReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // day, week, month, quarter, year

  // Real data from API
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalExpenses: 0,
    growth: 0,
    margin: 0,
  });
  const [chartData, setChartData] = useState([]);

  // Mock data for now (can be replaced with API calls later)
  const [sourceData, setSourceData] = useState(revenueSourceData);
  const [expenseData, setExpenseData] = useState(expenseBreakdownData);
  const [transactions, setTransactions] = useState(recentTransactions);

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      console.log("📊 Fetching revenue data for period:", period);

      // Fetch real data from API
      const [statsData, chartDataResult] = await Promise.all([
        directorService.getRevenueStats(period),
        directorService.getRevenueChart(period, 12),
      ]);

      console.log("📈 Revenue Stats:", statsData);
      console.log("📉 Chart Data:", chartDataResult);

      setStats(statsData);
      setChartData(chartDataResult);

      // TODO: Fetch sourceData, expenseData, transactions from API when available
      // For now, using mock data
    } catch (error) {
      console.error("❌ Error fetching revenue data:", error);
      toast.error("Không thể tải dữ liệu báo cáo tài chính");
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

  const handleExport = () => {
    try {
      // Tạo nội dung CSV
      const headers = ["Kỳ", "Doanh thu", "Chi phí", "Lợi nhuận"];
      const rows = chartData.map((item) => [
        item.month || item.name || item.label || "",
        item.revenue || 0,
        item.expenses || 0,
        item.profit || 0,
      ]);

      // Tạo CSV content
      let csvContent = headers.join(",") + "\n";
      rows.forEach((row) => {
        csvContent += row.join(",") + "\n";
      });

      // Thêm thống kê tổng quan
      csvContent += "\n--- THỐNG KÊ TỔNG QUAN ---\n";
      csvContent += `Tổng doanh thu,${stats.totalRevenue || 0}\n`;
      csvContent += `Tổng chi phí,${stats.totalExpenses || 0}\n`;
      csvContent += `Lợi nhuận,${stats.profit || 0}\n`;
      csvContent += `Tỷ suất lợi nhuận,${stats.margin || 0}%\n`;

      // Tạo Blob và download
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const fileName = `bao-cao-doanh-thu-${period}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Đã xuất báo cáo:", fileName);
    } catch (error) {
      console.error("❌ Lỗi xuất báo cáo:", error);
      alert("Lỗi khi xuất báo cáo. Vui lòng thử lại!");
    }
  };
  // --- Build Chart.js configs from state arrays (hooks must be unconditional) ---
  const lineChartConfig = React.useMemo(() => {
    const list = Array.isArray(chartData) ? chartData : [];
    const labels = list.map((i) => i.name || i.month || i.label || "");
    return {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data: list.map((i) => i.revenue || 0),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
        {
          label: "Chi phí",
          data: list.map((i) => i.expenses || 0),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
        {
          label: "Lợi nhuận",
          data: list.map((i) => i.profit || 0),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
      ],
    };
  }, [chartData]);

  const pieChartConfig = React.useMemo(() => {
    const list = Array.isArray(sourceData) ? sourceData : [];
    return {
      labels: list.map((i) => i.name),
      datasets: [
        {
          data: list.map((i) => i.value || 0),
          backgroundColor: list.map((i) => i.color || "#3b82f6"),
          borderWidth: 0,
        },
      ],
    };
  }, [sourceData]);

  const barChartConfig = React.useMemo(() => {
    const list = Array.isArray(expenseData) ? expenseData : [];
    return {
      labels: list.map((i) => i.name),
      datasets: [
        {
          label: "Chi phí (VND)",
          data: list.map((i) => i.value || 0),
          backgroundColor: list.map((i) => i.fill || "#f87171"),
          borderRadius: 4,
          barThickness: 36,
        },
      ],
    };
  }, [expenseData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading text="Đang tổng hợp dữ liệu tài chính..." />
      </div>
    );
  }

  const transactionColumns = [
    { key: "id", label: "Mã GD", className: "text-sm text-gray-500 font-mono" },
    {
      key: "content",
      label: "Nội Dung",
      className: "font-medium text-gray-900",
    },
    { key: "date", label: "Ngày", className: "text-sm text-gray-500" },
    { key: "amount", label: "Số Tiền", align: "right" },
    { key: "status", label: "Loại", align: "center" },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Báo Cáo Tài Chính
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Theo dõi dòng tiền, lợi nhuận và kiểm soát chi phí vận hành.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Xuất Báo Cáo
        </button>
      </div>

      <Card className="shadow-sm border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Filter className="w-5 h-5 text-gray-500" />
            <span>Bộ lọc thời gian:</span>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["week", "month", "quarter", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {p === "week" && "Tuần này"}
                {p === "month" && "Tháng này"}
                {p === "quarter" && "Quý này"}
                {p === "year" && "Năm nay"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          variant="blue"
          growth={stats.growth}
        />
        <StatCard
          title="Lợi Nhuận Ròng"
          value={formatCurrency(stats.totalProfit)}
          icon={<Wallet className="w-6 h-6" />}
          variant="green"
          subtitle={`Tỷ suất: ${stats.margin}%`}
        />
        <StatCard
          title="Tổng Chi Phí"
          value={formatCurrency(stats.totalExpenses)}
          icon={<CreditCard className="w-6 h-6" />}
          variant="red"
          subtitle="Chi phí vận hành"
        />
        <StatCard
          title="Dự Báo Tăng Trưởng"
          value={`+${stats.growth}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="teal"
          subtitle="So với cùng kỳ"
        />
      </div>

      {/* 4. Main Chart (Revenue vs Expenses) */}
      <Card
        title="Biểu Đồ Doanh Thu & Lợi Nhuận"
        className="shadow-sm border-gray-200"
      >
        <div className="mt-4">
          <LineChart data={lineChartConfig} height={350} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources (Pie Chart) */}
        <Card
          title="Cơ Cấu Nguồn Thu"
          className="shadow-sm border-gray-200"
          icon={<PieIcon className="w-4 h-4 text-gray-400" />}
        >
          <div className="mt-4 flex flex-col items-center">
            <PieChart data={pieChartConfig} height={300} />
          </div>
        </Card>

        {/* Expenses Breakdown (Bar Chart) */}
        <Card
          title="Phân Bổ Chi Phí"
          className="shadow-sm border-gray-200"
          icon={<CreditCard className="w-4 h-4 text-gray-400" />}
        >
          <div className="mt-4">
            <BarChart data={barChartConfig} height={300} />
          </div>
        </Card>
      </div>

      <Card title="Giao Dịch Gần Đây" className="shadow-sm border-gray-200">
        <div className="mt-2">
          <Table
            columns={transactionColumns}
            data={transactions.map((item) => ({
              id: item.id,
              content: item.content,
              date: item.date,
              amount: (
                <span
                  className={`font-semibold ${
                    item.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.type === "income" ? "+" : ""}
                  {formatCurrency(item.amount)}
                </span>
              ),
              status: (
                <Badge variant={item.type === "income" ? "success" : "error"}>
                  {item.type === "income" ? (
                    <ArrowUpRight className="w-3 h-3 inline mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 inline mr-1" />
                  )}
                  {item.type === "income" ? "Thu" : "Chi"}
                </Badge>
              ),
            }))}
          />
        </div>
      </Card>
    </div>
  );
};

// --- Sub Component: StatCard (Soft UI Style) ---
const StatCard = ({
  title,
  value,
  icon,
  variant = "blue",
  growth,
  subtitle,
}) => {
  // Map màu sắc Soft UI
  const variants = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  const currentStyle = variants[variant] || variants.blue;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {value}
          </h3>

          {/* Growth Indicator */}
          {growth !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                  growth >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {growth >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {growth > 0 ? "+" : ""}
                {growth}%
              </span>
              <span className="text-xs text-gray-400">so với kỳ trước</span>
            </div>
          )}

          {/* Subtitle (Alternative to Growth) */}
          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>

        {/* Icon Container with shrink-0 */}
        <div className={`p-3 rounded-xl shrink-0 ${currentStyle}`}>{icon}</div>
      </div>
    </div>
  );
};

export default RevenueReportPage;
