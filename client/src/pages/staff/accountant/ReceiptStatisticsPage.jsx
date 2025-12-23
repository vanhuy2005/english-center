import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Loading,
  Input,
} from "../../../components/common"; // Import path đúng
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  FileText,
  Download,
  Calendar as CalendarIcon,
  RefreshCw,
  PieChart as PieIcon,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { receiptService } from "@services/receiptService";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#3b9797"];

const ReceiptStatisticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalReceipts: 0,
    byMethod: [],
  });
  // Date range state: { start: string, end: string }
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [detailedData, setDetailedData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  const methodLabels = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    credit_card: "Thẻ tín dụng",
    momo: "MoMo",
    refund: "Hoàn tiền",
    other: "Khác",
  };

  // --- API CALLS ---
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.start && dateRange.end) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }

      const data = await receiptService.getStatistics(params);
      setStats({
        totalAmount: data.totalAmount || 0,
        totalReceipts: data.totalReceipts || 0,
        byMethod: data.byMethod || [],
      });

      processChartData(data.byMethod || [], data.dailyStats || []);
    } catch (error) {
      toast.error("Không thể tải thống kê");
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const processChartData = (methodData, dailyStats = []) => {
    // Process Pie Chart Data
    const detailed = methodData.map((item) => ({
      name: methodLabels[item._id] || item._id,
      value: item.total,
      count: item.count,
      originalMethod: item._id,
    }));
    setDetailedData(detailed);

    // Process Bar/Area Chart Data
    if (dailyStats.length > 0) {
      const formatted = dailyStats.map((stat) => ({
        date: dayjs(stat.date).format("DD/MM"),
        fullDate: stat.date,
        receipts: stat.receipts,
        amount: stat.amount,
      }));
      setDailyData(formatted);
    } else {
      generateDailyData();
    }
  };

  const generateDailyData = () => {
    const today = dayjs();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = today.subtract(6 - i, "day");
      return {
        date: date.format("DD/MM"),
        fullDate: date.format("YYYY-MM-DD"),
        receipts: 0,
        amount: 0,
      };
    });
    setDailyData(last7Days);
  };

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // --- HANDLERS ---
  const handleReset = () => {
    setDateRange({ start: "", end: "" });
  };

  const handleExport = () => {
    try {
      const lines = [];
      lines.push(["Section", "Key", "Value"].join(","));

      // Summary
      lines.push(["Summary", "totalAmount", stats.totalAmount || 0].join(","));
      lines.push(["Summary", "totalReceipts", stats.totalReceipts || 0].join(","));
      lines.push(["Summary", "averageAmount", averageAmount].join(","));
      lines.push([]);

      // By Method
      lines.push(["ByMethod", "method", "count", "total"].join(","));
      (detailedData || []).forEach((m) => {
        lines.push(["ByMethod", m.name || "", m.count || 0, m.value || 0].join(","));
      });
      lines.push([]);

      // Daily data
      lines.push(["Daily", "date", "receipts", "amount"].join(","));
      (dailyData || []).forEach((d) => {
        lines.push(["Daily", d.fullDate || "", d.receipts || 0, d.amount || 0].join(","));
      });

      const csvContent = lines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = dayjs().format("YYYYMMDD_HHmmss");
      a.href = url;
      a.download = `receipt_statistics_${now}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Đã tải xuống báo cáo");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Xuất báo cáo thất bại");
    }
  };

  const averageAmount = stats.totalReceipts > 0 ? Math.floor(stats.totalAmount / stats.totalReceipts) : 0;

  // --- SUB COMPONENT: Stat Card ---
  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, prefix = "" }) => (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="p-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-2xl font-extrabold ${colorClass}`}>
             {prefix}{new Intl.NumberFormat("vi-VN").format(value)}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <BarChart className="w-6 h-6 text-white" /> {/* Note: lucide-react BarChart alias issue, using BarChart3 is safer if imported */}
               </div>
               Thống Kê Doanh Thu
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Phân tích số liệu từ phiếu thu
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
             <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <input 
                   type="date" 
                   className="bg-transparent text-sm px-2 py-1 outline-none text-gray-600"
                   value={dateRange.start}
                   onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <span className="text-gray-400">-</span>
                <input 
                   type="date" 
                   className="bg-transparent text-sm px-2 py-1 outline-none text-gray-600"
                   value={dateRange.end}
                   onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
             </div>
             
             <Button variant="outline" onClick={handleReset} title="Đặt lại">
                <RefreshCw size={16} />
             </Button>
             
             <Button 
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-md"
                onClick={handleExport}
             >
                <Download size={16} className="mr-2"/> Xuất Báo Cáo
             </Button>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard 
              title="Tổng Doanh Thu" 
              value={stats.totalAmount} 
              icon={DollarSign} 
              colorClass="text-blue-600" 
              bgClass="bg-blue-50"
              prefix="₫ "
           />
           <StatCard 
              title="Số Phiếu Thu" 
              value={stats.totalReceipts} 
              icon={FileText} 
              colorClass="text-emerald-600" 
              bgClass="bg-emerald-50"
           />
           <StatCard 
              title="Doanh Thu Trung Bình" 
              value={averageAmount} 
              icon={TrendingUp} 
              colorClass="text-amber-600" 
              bgClass="bg-amber-50"
              prefix="₫ "
           />
           <StatCard 
              title="Phương Thức Phổ Biến" 
              value={detailedData.length > 0 
                 ? detailedData.reduce((max, item) => item.value > max.value ? item : max).name 
                 : "N/A"
              } 
              icon={CreditCard} 
              colorClass="text-purple-600" 
              bgClass="bg-purple-50"
              prefix="" // No prefix for string
           />
        </div>

        {/* --- CHARTS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Pie Chart */}
           <Card className="border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <PieIcon size={20} className="text-blue-500"/> Tỷ lệ phương thức thanh toán
              </h3>
              {detailedData.length > 0 ? (
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={detailedData}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             {detailedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip 
                             formatter={(value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)}
                             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          />
                          <Legend />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              ) : (
                 <div className="h-[300px] flex items-center justify-center text-gray-400">Không có dữ liệu</div>
              )}
           </Card>

           {/* Bar Chart */}
           <Card className="border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <TrendingUp size={20} className="text-emerald-500"/> Doanh thu theo ngày (7 ngày gần nhất)
              </h3>
              {dailyData.length > 0 ? (
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `${val/1000000}M`} />
                          <Tooltip 
                             cursor={{fill: '#f3f4f6'}}
                             formatter={(value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)}
                             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          />
                          <Bar dataKey="amount" fill="#3b9797" radius={[4, 4, 0, 0]} barSize={40} name="Doanh thu" />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              ) : (
                 <div className="h-[300px] flex items-center justify-center text-gray-400">Không có dữ liệu</div>
              )}
           </Card>
        </div>

        {/* --- CUMULATIVE AREA CHART --- */}
        <Card className="border border-gray-200 shadow-sm p-6">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600"/> Tổng doanh thu tích lũy
           </h3>
           {dailyData.length > 0 ? (
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                       data={dailyData.map((item, idx) => ({
                          ...item,
                          cumulative: dailyData.slice(0, idx + 1).reduce((sum, d) => sum + d.amount, 0),
                       }))}
                    >
                       <defs>
                          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
                             <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `${val/1000000}M`} />
                       <Tooltip 
                          formatter={(value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)}
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                       />
                       <Area 
                          type="monotone" 
                          dataKey="cumulative" 
                          stroke="#1890ff" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorCumulative)" 
                          name="Tích lũy" 
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">Không có dữ liệu</div>
           )}
        </Card>

        {/* --- DETAILS TABLE --- */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
           <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Chi tiết theo phương thức thanh toán</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                    <tr>
                       <th className="px-6 py-4">Phương thức</th>
                       <th className="px-6 py-4 text-right">Số lượng giao dịch</th>
                       <th className="px-6 py-4 text-right">Tổng tiền</th>
                       <th className="px-6 py-4 text-center">Tỷ lệ đóng góp</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {detailedData.map((row, idx) => (
                       <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-700">{row.name}</td>
                          <td className="px-6 py-4 text-right text-gray-600">{row.count}</td>
                          <td className="px-6 py-4 text-right font-bold text-[var(--color-primary)]">
                             {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.value)}
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
                                {stats.totalAmount > 0 ? ((row.value / stats.totalAmount) * 100).toFixed(2) : 0}%
                             </span>
                          </td>
                       </tr>
                    ))}
                    {detailedData.length === 0 && (
                       <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Chưa có dữ liệu</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>

      </div>
    </div>
  );
};

export default ReceiptStatisticsPage;