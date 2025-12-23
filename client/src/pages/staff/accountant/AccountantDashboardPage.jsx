import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { receiptService } from "@services/receiptService";
import { Card, Loading, Badge } from "@components/common";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  Receipt,
  Calendar,
  Users,
  CreditCard,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  PlusCircle,
  Search,
  FileText
} from "lucide-react";
import { LineChart, PieChart } from "@components/charts";

const AccountantDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRevenue: 0,
      monthRevenue: 0,
      pendingPayments: 0,
      overduePayments: 0,
    },
    recentTransactions: [],
    revenueTrend: { labels: [], datasets: [] },
    paymentStatus: { labels: [], datasets: [] },
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get Recent Receipts
      let recentReceipts = [];
      try {
        const recentResponse = await receiptService.getRecentReceipts();
        recentReceipts = recentResponse.receipts || [];
      } catch (recentError) {
        console.warn("Failed to load recent receipts:", recentError);
      }

      // 2. Get All Receipts for Calculation
      const response = await receiptService.getReceipts({
        limit: 1000, 
        sort: "-createdAt",
      });
      const receipts = response.data || [];

      // 3. Calculate Stats
      const totalRevenue = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
      
      const today = new Date();
      const monthRevenue = receipts
        .filter((r) => {
          const receiptDate = new Date(r.createdAt);
          return (
            receiptDate.getMonth() === today.getMonth() &&
            receiptDate.getFullYear() === today.getFullYear()
          );
        })
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      const paidCount = receipts.filter(r => r.status === 'paid').length;
      const pendingCount = receipts.filter(r => r.status === 'pending').length;
      const overdueCount = receipts.filter(r => r.status === 'overdue').length;

      // 4. Prepare Chart Data
      setDashboardData({
        stats: {
          totalRevenue,
          monthRevenue,
          pendingPayments: pendingCount,
          overduePayments: overdueCount,
        },
        recentTransactions: recentReceipts.map((r) => ({
          _id: r._id,
          transactionCode: r.receiptNumber || r._id.substring(0, 8).toUpperCase(),
          student: r.student,
          class: r.class,
          amount: r.amount,
          status: r.status || "pending",
          createdAt: r.createdAt,
          paymentMethod: r.paymentMethod,
        })),
        revenueTrend: {
           labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
           datasets: [{
              label: "Doanh thu (VND)",
              data: [monthRevenue * 0.2, monthRevenue * 0.3, monthRevenue * 0.15, monthRevenue * 0.35], // Mock distribution
              borderColor: "#3b9797", // Secondary Color
              backgroundColor: "rgba(59, 151, 151, 0.1)",
              tension: 0.4,
              fill: true
           }]
        },
        paymentStatus: {
           labels: ["Đã thanh toán", "Chờ xử lý", "Quá hạn"],
           datasets: [{
              data: [paidCount, pendingCount, overdueCount],
              backgroundColor: ["#10b981", "#f59e0b", "#ef4444"], // Emerald, Amber, Red
              borderWidth: 0
           }]
        }
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setError("error");
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

  // --- SUB COMPONENT: Stat Card ---
  const StatCard = ({ title, value, icon: Icon, color, subText }) => {
    const styles = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      rose: "bg-rose-50 text-rose-600 border-rose-100",
    };

    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all group">
        <div className="p-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-extrabold text-[var(--color-primary)] truncate" title={value}>{value}</h3>
            {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
          </div>
          <div className={`p-3 rounded-xl border ${styles[color]} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
        </div>
      </Card>
    );
  };

  // --- SUB COMPONENT: New Professional Quick Action Button ---
  const QuickActionCard = ({ icon: Icon, title, desc, colorClass, bgClass, onClick }) => (
     <button 
        onClick={onClick}
        className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-[var(--color-secondary)] hover:shadow-md transition-all group text-left w-full h-full"
     >
        <div className={`p-3 rounded-lg ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}>
           <Icon size={24} />
        </div>
        <div className="ml-4 flex-1">
           <h4 className="font-bold text-gray-700 group-hover:text-[var(--color-primary)] transition-colors text-sm">{title}</h4>
           <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{desc}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
            <ArrowRight size={16} />
        </div>
     </button>
  );

  const getStatusBadge = (status) => {
     switch(status) {
        case 'paid': return <Badge variant="success">Đã thanh toán</Badge>;
        case 'pending': return <Badge variant="warning">Chờ xử lý</Badge>;
        case 'overdue': return <Badge variant="danger">Quá hạn</Badge>;
        default: return <Badge variant="secondary">Nháp</Badge>;
     }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  const { stats, recentTransactions, revenueTrend, paymentStatus } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <BarChart3 className="w-6 h-6 text-white" />
               </div>
               Tổng Quan Kế Toán
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Báo cáo tài chính và quản lý thu chi
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
             <Calendar size={16} />
             <span>Hôm nay: {new Date().toLocaleDateString("vi-VN")}</span>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng Doanh Thu"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            color="emerald"
            subText="Tổng thu thực tế"
          />
          <StatCard
            title="Doanh Thu Tháng"
            value={formatCurrency(stats.monthRevenue)}
            icon={TrendingUp}
            color="blue"
            subText="Tháng hiện tại"
          />
          <StatCard
            title="Chờ Thanh Toán"
            value={stats.pendingPayments}
            icon={Clock}
            color="amber"
            subText="Giao dịch đang xử lý"
          />
          <StatCard
            title="Quá Hạn"
            value={stats.overduePayments}
            icon={AlertCircle}
            color="rose"
            subText="Cần nhắc nhở"
          />
        </div>

        {/* --- QUICK ACTIONS (NEW DESIGN) --- */}
        <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Thao tác nhanh</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard 
                    icon={PlusCircle} 
                    title="Tạo Hóa Đơn Mới" 
                    desc="Lập phiếu thu cho học viên" 
                    colorClass="text-blue-600" 
                    bgClass="bg-blue-50"
                    onClick={() => navigate("/accountant/transactions/create")}
                />
                <QuickActionCard 
                    icon={Users} 
                    title="Tra Cứu Học Phí" 
                    desc="Kiểm tra công nợ học viên" 
                    colorClass="text-emerald-600" 
                    bgClass="bg-emerald-50"
                    onClick={() => navigate("/accountant/students")}
                />
                <QuickActionCard 
                    icon={FileText} 
                    title="Quản Lý Giao Dịch" 
                    desc="Xem lịch sử thu chi" 
                    colorClass="text-purple-600" 
                    bgClass="bg-purple-50"
                    onClick={() => navigate("/accountant/transactions")}
                />
                <QuickActionCard 
                    icon={BarChart3} 
                    title="Báo Cáo Tài Chính" 
                    desc="Xuất báo cáo doanh thu" 
                    colorClass="text-orange-600" 
                    bgClass="bg-orange-50"
                    onClick={() => navigate("/accountant/reports")}
                />
            </div>
        </div>

        {/* --- CHARTS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Revenue Chart */}
           <div className="lg:col-span-2">
              <Card className="border border-gray-200 shadow-sm h-full">
                 <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                       <TrendingUp size={18} className="text-[var(--color-secondary)]"/> Xu hướng doanh thu
                    </h3>
                 </div>
                 <div className="p-5 h-[320px]">
                    <LineChart data={revenueTrend} options={{ maintainAspectRatio: false }} />
                 </div>
              </Card>
           </div>

           {/* Payment Status */}
           <div className="lg:col-span-1">
              <Card className="border border-gray-200 shadow-sm h-full">
                 <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                       <PieIcon size={18} className="text-blue-500"/> Tỷ lệ thanh toán
                    </h3>
                 </div>
                 <div className="p-5 h-[320px] flex justify-center">
                    <PieChart data={paymentStatus} options={{ maintainAspectRatio: false }} />
                 </div>
              </Card>
           </div>
        </div>

        {/* --- RECENT TRANSACTIONS TABLE --- */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
           <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                 <Receipt size={18} className="text-[var(--color-secondary)]"/> Giao dịch gần đây
              </h3>
              <button 
                 onClick={() => navigate("/accountant/transactions")}
                 className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                 Xem tất cả <ArrowRight size={12}/>
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                    <tr>
                       <th className="px-6 py-4">Mã GD</th>
                       <th className="px-6 py-4">Học Viên</th>
                       <th className="px-6 py-4">Lớp Học</th>
                       <th className="px-6 py-4">Số Tiền</th>
                       <th className="px-6 py-4">Phương Thức</th>
                       <th className="px-6 py-4">Ngày Tạo</th>
                       <th className="px-6 py-4 text-right">Trạng Thái</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {recentTransactions.length > 0 ? (
                       recentTransactions.map((tx) => (
                          <tr key={tx._id} className="hover:bg-blue-50/30 transition-colors group">
                             <td className="px-6 py-4 font-mono text-xs text-gray-600 group-hover:text-blue-600 transition-colors">
                                {tx.transactionCode}
                             </td>
                             <td className="px-6 py-4 font-medium text-[var(--color-primary)]">{tx.student?.fullName || "N/A"}</td>
                             <td className="px-6 py-4 text-gray-600">{tx.class?.name || "N/A"}</td>
                             <td className="px-6 py-4 font-bold text-gray-800">{formatCurrency(tx.amount)}</td>
                             <td className="px-6 py-4">
                                <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-md text-gray-600 border border-gray-200">
                                   {tx.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : tx.paymentMethod === 'cash' ? 'Tiền mặt' : tx.paymentMethod || 'Khác'}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
                             <td className="px-6 py-4 text-right">
                                {getStatusBadge(tx.status)}
                             </td>
                          </tr>
                       ))
                    ) : (
                       <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                             <div className="flex flex-col items-center">
                                <Receipt size={40} className="mb-2 text-gray-200" />
                                <p>Chưa có giao dịch nào gần đây</p>
                             </div>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>

      </div>
    </div>
  );
};

export default AccountantDashboardPage;