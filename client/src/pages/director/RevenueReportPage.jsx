import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { LineChart, BarChart, PieChart } from "@components/charts"; // Đảm bảo import PieChart
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
  ArrowDownRight
} from "lucide-react";

// Import dữ liệu Mock
import {
  revenueStats,
  revenueTrendData,
  revenueSourceData,
  expenseBreakdownData,
  recentTransactions
} from "./mockRevenueData";

/**
 * Revenue Report Page - Báo cáo doanh thu (Polished UI)
 */
const RevenueReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // day, week, month, quarter, year
  
  // State quản lý dữ liệu
  const [stats, setStats] = useState(revenueStats);
  const [chartData, setChartData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      // Giả lập call API
      await new Promise(resolve => setTimeout(resolve, 800));

      setStats(revenueStats);
      setChartData(revenueTrendData);
      setSourceData(revenueSourceData);
      setExpenseData(expenseBreakdownData);
      setTransactions(recentTransactions);

    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper format tiền tệ VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleExport = () => {
    alert("Đang xuất báo cáo ra file Excel...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading text="Đang tổng hợp dữ liệu tài chính..." />
      </div>
    );
  }

  // Cấu hình cột cho bảng giao dịch
  const transactionColumns = [
    { key: "id", label: "Mã GD", className: "text-sm text-gray-500 font-mono" },
    { key: "content", label: "Nội Dung", className: "font-medium text-gray-900" },
    { key: "date", label: "Ngày", className: "text-sm text-gray-500" },
    { key: "amount", label: "Số Tiền", align: "right" },
    { key: "status", label: "Loại", align: "center" }
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

      {/* 2. Filter Bar */}
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

      {/* 3. Statistics Cards */}
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
      <Card title="Biểu Đồ Doanh Thu & Lợi Nhuận" className="shadow-sm border-gray-200">
        <div className="mt-4">
            <LineChart
            data={chartData}
            lines={[
                {
                dataKey: "revenue",
                name: "Doanh thu",
                stroke: "#3b82f6", // Blue-500
                strokeWidth: 2
                },
                {
                dataKey: "expenses",
                name: "Chi phí",
                stroke: "#ef4444", // Red-500
                strokeWidth: 2
                },
                {
                dataKey: "profit",
                name: "Lợi nhuận",
                stroke: "#10b981", // Emerald-500
                strokeWidth: 2,
                activeDot: { r: 6 } // Highlight dot
                },
            ]}
            height={350}
            />
        </div>
      </Card>

      {/* 5. Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources (Pie Chart) */}
        <Card title="Cơ Cấu Nguồn Thu" className="shadow-sm border-gray-200" icon={<PieIcon className="w-4 h-4 text-gray-400"/>}>
            <div className="mt-4 flex flex-col items-center">
                <PieChart
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    height={300}
                    // Colors are defined in mock data
                />
            </div>
        </Card>

        {/* Expenses Breakdown (Bar Chart) */}
        <Card title="Phân Bổ Chi Phí" className="shadow-sm border-gray-200" icon={<CreditCard className="w-4 h-4 text-gray-400"/>}>
            <div className="mt-4">
                <BarChart
                    data={expenseData}
                    bars={[
                        {
                        dataKey: "value",
                        name: "Chi phí (VND)",
                        fill: "#f87171", // Mặc định nếu không có trong data
                        barSize: 40,
                        radius: [4, 4, 0, 0]
                        },
                    ]}
                    height={300}
                />
            </div>
        </Card>
      </div>

      {/* 6. Recent Transactions Table */}
      <Card title="Giao Dịch Gần Đây" className="shadow-sm border-gray-200">
        <div className="mt-2">
            <Table 
                columns={transactionColumns}
                data={transactions.map(item => ({
                    id: item.id,
                    content: item.content,
                    date: item.date,
                    amount: (
                        <span className={`font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.type === 'income' ? '+' : ''}
                            {formatCurrency(item.amount)}
                        </span>
                    ),
                    status: (
                        <Badge variant={item.type === 'income' ? 'success' : 'error'}>
                            {item.type === 'income' ? <ArrowUpRight className="w-3 h-3 inline mr-1"/> : <ArrowDownRight className="w-3 h-3 inline mr-1"/>}
                            {item.type === 'income' ? 'Thu' : 'Chi'}
                        </Badge>
                    )
                }))}
            />
        </div>
      </Card>

    </div>
  );
};

// --- Sub Component: StatCard (Soft UI Style) ---
const StatCard = ({ title, value, icon, variant = "blue", growth, subtitle }) => {
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
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
          
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
                {growth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {growth > 0 ? "+" : ""}{growth}%
              </span>
              <span className="text-xs text-gray-400">so với kỳ trước</span>
            </div>
          )}

          {/* Subtitle (Alternative to Growth) */}
          {subtitle && (
             <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        
        {/* Icon Container with shrink-0 */}
        <div className={`p-3 rounded-xl shrink-0 ${currentStyle}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default RevenueReportPage;