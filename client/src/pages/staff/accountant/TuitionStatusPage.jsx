import React, { useState, useCallback, useEffect } from "react";
import {
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Filter,
  Eye,
  FileText
} from "lucide-react";
import { 
  Card, 
  Button, 
  Badge, 
  Loading, 
} from "@components/common"; 
import { useNavigate } from "react-router-dom";
// Đảm bảo bạn đã tạo file financeService.js như hướng dẫn ở trên
import { financeService } from "@services/financeService"; 
import { toast } from "react-hot-toast";

const TuitionStatusPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState([]);

  // --- API FETCHING ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách học phí từ Finance
      const response = await financeService.getAll({ limit: 100 });
      
      // Handle different response structures an toàn
      let financeData = [];
      if (Array.isArray(response?.data)) financeData = response.data;
      else if (Array.isArray(response?.data?.data)) financeData = response.data.data;
      else if (Array.isArray(response)) financeData = response;

      // Transform API data sang format hiển thị
      const transformedData = financeData.map((item) => ({
        id: item._id,
        studentId: item.student?._id || "N/A",
        studentCode: item.student?.studentCode || "N/A",
        studentName: item.student?.fullName || "Unknown",
        class: item.course?.name || item.course?.courseCode || "N/A",
        totalAmount: item.amount || 0,
        paidAmount: item.paidAmount || 0,
        remainingAmount: item.remainingAmount || 0,
        status: item.status || "pending",
        dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString("vi-VN") : "N/A",
      }));

      setData(transformedData);
    } catch (error) {
      console.error("Error fetching tuition data:", error);
      // Fallback data rỗng để UI không crash
      setData([]); 
      // Không toast lỗi ở đây để tránh spam nếu backend chưa sẵn sàng
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const configs = {
      paid: { color: "success", text: "Đã thanh toán", icon: <CheckCircle size={14} /> },
      partial: { color: "warning", text: "Thanh toán 1 phần", icon: <Clock size={14} /> },
      unpaid: { color: "secondary", text: "Chưa thanh toán", icon: <AlertCircle size={14} /> },
      pending: { color: "secondary", text: "Chờ xử lý", icon: <Clock size={14} /> },
      overdue: { color: "danger", text: "Quá hạn", icon: <AlertCircle size={14} /> },
    };
    const config = configs[status] || configs.unpaid;
    
    return (
      <Badge variant={config.color} className="flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap">
        {config.icon} {config.text}
      </Badge>
    );
  };

  // --- HANDLERS ---
  const handleCreateReceipt = useCallback((studentId) => {
      navigate("/accountant/transactions/create", { 
        state: { studentId: studentId || null, returnToTuition: true },
      });
  }, [navigate]);

  const handleViewDetails = useCallback((studentId) => {
      navigate(`/accountant/students/${studentId}`);
  }, [navigate]);

  const handleUpdateTuition = useCallback(() => {
      toast.info("Tính năng cập nhật học phí đang phát triển");
  }, []);

  // --- STATS CALCULATION ---
  const stats = {
    total: data.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
    paid: data.reduce((sum, item) => sum + (item.paidAmount || 0), 0),
    remaining: data.reduce((sum, item) => sum + (item.remainingAmount || 0), 0),
    overdue: data.filter((item) => item.status === "overdue").length,
  };

  // --- FILTERING ---
  const filteredData = data.filter((item) => {
    const matchSearch =
      searchText === "" ||
      item.studentCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // --- SUB COMPONENT: Stat Card ---
  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, subText }) => (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="p-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-2xl font-extrabold ${colorClass}`}>{value}</h3>
          {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
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
                  <DollarSign className="w-6 h-6 text-white" />
               </div>
               Tình Hình Học Phí
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Theo dõi công nợ và tình hình thanh toán của học viên
            </p>
          </div>
          <div className="flex gap-3">
             <Button 
                variant="outline" 
                onClick={handleUpdateTuition}
                className="border-gray-300 text-gray-700 hover:text-[var(--color-primary)] bg-white"
             >
                <RefreshCw size={18} className="mr-2"/> Cập nhật
             </Button>
             <Button 
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-md border-none"
                onClick={() => handleCreateReceipt()}
             >
                <Plus size={18} className="mr-2"/> Thu tiền mới
             </Button>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Tổng Học Phí" 
            value={formatCurrency(stats.total)} 
            icon={DollarSign} 
            colorClass="text-blue-600" 
            bgClass="bg-blue-50"
          />
          <StatCard 
            title="Đã Thu" 
            value={formatCurrency(stats.paid)} 
            icon={CheckCircle} 
            colorClass="text-emerald-600" 
            bgClass="bg-emerald-50" 
          />
          <StatCard 
            title="Còn Lại" 
            value={formatCurrency(stats.remaining)} 
            icon={Clock} 
            colorClass="text-amber-600" 
            bgClass="bg-amber-50" 
          />
          <StatCard 
            title="Học Viên Quá Hạn" 
            value={`${stats.overdue} HV`} 
            icon={AlertCircle} 
            colorClass="text-rose-600" 
            bgClass="bg-rose-50" 
            subText="Cần nhắc nhở"
          />
        </div>

        {/* --- TOOLBAR --- */}
        <Card className="border border-gray-200 shadow-sm">
           <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                 <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên hoặc mã học viên..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none transition-all text-sm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                 />
              </div>
              <div className="relative w-full md:w-64">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <select 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm cursor-pointer appearance-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                 >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="partial">Thanh toán 1 phần</option>
                    <option value="unpaid">Chưa thanh toán</option>
                    <option value="overdue">Quá hạn</option>
                 </select>
              </div>
           </div>
        </Card>

        {/* --- TABLE --- */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Mã HV</th>
                  <th className="px-6 py-4">Họ và Tên</th>
                  <th className="px-6 py-4">Lớp Học</th>
                  <th className="px-6 py-4 text-right">Tổng Học Phí</th>
                  <th className="px-6 py-4 text-right">Đã Đóng</th>
                  <th className="px-6 py-4 text-right">Còn Lại</th>
                  <th className="px-6 py-4 text-center">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{row.studentCode}</td>
                      <td className="px-6 py-4 font-medium text-[var(--color-primary)]">{row.studentName}</td>
                      <td className="px-6 py-4 text-gray-600">{row.class}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatCurrency(row.totalAmount)}</td>
                      <td className="px-6 py-4 text-right text-emerald-600">{formatCurrency(row.paidAmount)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${row.remainingAmount > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                         {formatCurrency(row.remainingAmount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                         {getStatusBadge(row.status)}
                         {row.remainingAmount > 0 && <div className="text-[10px] text-gray-400 mt-1">Hạn: {row.dueDate}</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                               size="sm" 
                               variant="ghost"
                               className="text-gray-500 hover:text-blue-600 h-8 w-8 p-0 rounded-full"
                               title="Xem chi tiết"
                               onClick={() => handleViewDetails(row.studentId)}
                            >
                               <Eye size={16} />
                            </Button>
                            
                            {row.remainingAmount > 0 && (
                               <Button 
                                  size="sm" 
                                  className="h-8 px-3 text-xs bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-sm border-none"
                                  onClick={() => handleCreateReceipt(row.studentId)}
                               >
                                  <DollarSign size={14} className="mr-1" /> Thu tiền
                               </Button>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center text-gray-400">
                       <div className="flex flex-col items-center">
                          <div className="p-4 bg-gray-50 rounded-full mb-3">
                             <FileText size={40} className="text-gray-300" />
                          </div>
                          <p className="font-medium">Không tìm thấy dữ liệu phù hợp</p>
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

export default TuitionStatusPage;