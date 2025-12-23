import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Eye,
  Printer,
  Search,
  Plus,
  Download,
  Filter,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
  Calendar as CalendarIcon,
  X
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Select,
  Modal
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
  ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import { receiptService } from "@services/receiptService";
import { toast } from "react-hot-toast";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#3b9797"];

const ReceiptManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    totalReceipts: 0,
    byMethod: [],
  });
  const [detailedData, setDetailedData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  
  // Filters
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'stats'

  // --- HELPERS ---
  const typeLabels = {
    tuition: "Học phí",
    material: "Tài liệu",
    exam: "Thi cử",
    other: "Khác",
  };

  const methodLabels = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    credit_card: "Thẻ tín dụng",
    momo: "MoMo",
    refund: "Hoàn tiền",
    other: "Khác",
  };

  const methodIcons = {
    cash: <Banknote size={14}/>,
    bank_transfer: <CreditCard size={14}/>,
    credit_card: <CreditCard size={14}/>,
    momo: <Smartphone size={14}/>,
    refund: <RotateCcw size={14}/>,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // --- API CALLS ---
  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        paymentMethod: methodFilter !== 'all' ? methodFilter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      };

      const data = await receiptService.getReceipts(params);
      setReceipts(data.receipts || []);
      setPagination((prev) => ({ ...prev, total: data.total || 0 }));
    } catch (error) {
      toast.error("Không thể tải danh sách phiếu thu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, typeFilter, methodFilter, dateRange]);

  const fetchStatistics = useCallback(async () => {
    try {
      const params = {};
      if (dateRange.start && dateRange.end) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }

      const data = await receiptService.getStatistics(params);
      setStatistics({
        totalAmount: data.totalAmount || 0,
        totalReceipts: data.totalReceipts || 0,
        byMethod: data.byMethod || [],
      });

      processChartData(data.byMethod || [], data.dailyStats || []);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReceipts();
    fetchStatistics();
  }, [fetchReceipts, fetchStatistics]);

  const processChartData = (methodData, dailyStats = []) => {
    const detailed = methodData.map((item) => ({
      name: methodLabels[item._id] || item._id,
      value: item.total,
      count: item.count,
    }));
    setDetailedData(detailed);

    // Xử lý daily stats (nếu API trả về thiếu ngày thì fill vào)
    // Ở đây giả sử API trả về mảng object { date: 'YYYY-MM-DD', amount: 100 }
    setDailyData(dailyStats.map(stat => ({
       date: new Date(stat.date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}),
       amount: stat.amount
    })));
  };

  // --- HANDLERS ---
  const handleViewDetail = async (record) => {
    try {
      // Nếu record đã đủ thông tin thì dùng luôn, không cần fetch lại nếu không cần thiết
      // Nhưng để an toàn ta fetch lại chi tiết
      // const detail = await receiptService.getReceiptById(record._id); 
      setSelectedReceipt(record); // Dùng tạm record có sẵn để demo nhanh
      setDetailModalVisible(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết phiếu thu");
    }
  };

  const handlePrint = (record) => {
    const printWindow = window.open("", "_blank");
    // Template in HTML
    const html = `
      <html>
      <head>
        <title>Phiếu Thu - ${record.receiptNumber}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #000; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header h1 { font-size: 24px; margin: 0 0 10px 0; text-transform: uppercase; }
          .header p { margin: 5px 0; font-size: 14px; }
          .title { text-align: center; font-size: 28px; font-weight: bold; margin: 30px 0 10px; text-transform: uppercase; }
          .meta { text-align: center; font-style: italic; margin-bottom: 30px; }
          .content { line-height: 1.8; font-size: 16px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { font-weight: bold; width: 180px; }
          .value { flex: 1; border-bottom: 1px dotted #ccc; }
          .amount-box { border: 2px solid #000; padding: 20px; text-align: center; margin: 30px 0; font-weight: bold; font-size: 20px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
          .sig-block { width: 40%; }
          .sig-title { font-weight: bold; margin-bottom: 80px; text-transform: uppercase; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TRUNG TÂM ANH NGỮ ENGLISH HUB</h1>
          <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p>Hotline: 1900 1234 - Email: contact@englishhub.edu.vn</p>
        </div>
        
        <div class="title">PHIẾU THU</div>
        <div class="meta">Số: ${record.receiptNumber} | Ngày: ${new Date(record.createdAt).toLocaleDateString('vi-VN')}</div>

        <div class="content">
          <div class="row"><span class="label">Họ tên người nộp:</span><span class="value">${record.student?.fullName || '................................................'}</span></div>
          <div class="row"><span class="label">Mã học viên:</span><span class="value">${record.student?.studentCode || '................................................'}</span></div>
          <div class="row"><span class="label">Địa chỉ/Lớp:</span><span class="value">${record.class?.name || '................................................'}</span></div>
          <div class="row"><span class="label">Lý do nộp:</span><span class="value">${typeLabels[record.type] || record.type || 'Học phí'}</span></div>
          <div class="row"><span class="label">Số tiền:</span><span class="value">${formatCurrency(record.amount)}</span></div>
          <div class="row"><span class="label">Bằng chữ:</span><span class="value" style="font-style: italic;">........................................................................................................</span></div>
          <div class="row"><span class="label">Ghi chú:</span><span class="value">${record.note || 'Không có'}</span></div>
        </div>

        <div class="signatures">
          <div class="sig-block">
            <div class="sig-title">Người nộp tiền</div>
            <div>(Ký, họ tên)</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">Người thu tiền</div>
            <div>(Ký, họ tên)</div>
            <div style="margin-top: 80px; font-weight: bold;">${record.createdBy?.fullName || 'Admin'}</div>
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid": return <Badge variant="success">Đã thanh toán</Badge>;
      case "pending": return <Badge variant="warning">Chờ xử lý</Badge>;
      case "overdue": return <Badge variant="danger">Quá hạn</Badge>;
      case "refunded": return <Badge variant="info">Đã hoàn tiền</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading && !receipts.length) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <FileText className="w-6 h-6 text-white" />
               </div>
               Quản Lý Phiếu Thu
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Danh sách và lịch sử giao dịch tài chính
            </p>
          </div>
          <Button 
             className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-md"
             onClick={() => navigate("/accountant/transactions/create")}
          >
             <Plus size={18} className="mr-2"/> Tạo Phiếu Thu
          </Button>
        </div>

        {/* --- TABS --- */}
        <div className="flex gap-4 border-b border-gray-200">
           <button 
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'list' ? 'border-[var(--color-secondary)] text-[var(--color-secondary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('list')}
           >
              Danh sách phiếu thu
           </button>
           <button 
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stats' ? 'border-[var(--color-secondary)] text-[var(--color-secondary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('stats')}
           >
              Báo cáo thống kê
           </button>
        </div>

        {/* --- CONTENT: LIST VIEW --- */}
        {activeTab === 'list' && (
           <>
              {/* Toolbar */}
              <Card className="border border-gray-200 shadow-sm">
                 <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-1">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                       <input 
                          type="text" 
                          placeholder="Tìm mã phiếu, tên HV..." 
                          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                       />
                    </div>
                    <select 
                       className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
                       value={typeFilter}
                       onChange={(e) => setTypeFilter(e.target.value)}
                    >
                       <option value="all">Tất cả loại thu</option>
                       <option value="tuition">Học phí</option>
                       <option value="material">Tài liệu</option>
                       <option value="exam">Lệ phí thi</option>
                    </select>
                    <select 
                       className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
                       value={methodFilter}
                       onChange={(e) => setMethodFilter(e.target.value)}
                    >
                       <option value="all">Tất cả phương thức</option>
                       <option value="cash">Tiền mặt</option>
                       <option value="bank_transfer">Chuyển khoản</option>
                       <option value="momo">Ví điện tử</option>
                    </select>
                    <div className="flex gap-2">
                       <input 
                          type="date" 
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                       />
                       <input 
                          type="date" 
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                       />
                    </div>
                 </div>
              </Card>

              {/* Table */}
              <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                          <tr>
                             <th className="px-6 py-4">Mã phiếu</th>
                             <th className="px-6 py-4">Ngày thu</th>
                             <th className="px-6 py-4">Học viên</th>
                             <th className="px-6 py-4">Loại thu</th>
                             <th className="px-6 py-4 text-right">Số tiền</th>
                             <th className="px-6 py-4">Phương thức</th>
                             <th className="px-6 py-4 text-center">Trạng thái</th>
                             <th className="px-6 py-4 text-right">Thao tác</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {receipts.length > 0 ? (
                             receipts.map((row) => (
                                <tr key={row._id} className="hover:bg-blue-50/30 transition-colors group">
                                   <td className="px-6 py-4 font-mono text-xs text-gray-600">{row.receiptNumber}</td>
                                   <td className="px-6 py-4 text-gray-500">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</td>
                                   <td className="px-6 py-4 font-medium text-[var(--color-primary)]">
                                      {row.student?.fullName}
                                      <p className="text-[10px] text-gray-400 font-mono">{row.student?.studentCode}</p>
                                   </td>
                                   <td className="px-6 py-4 text-gray-600">{typeLabels[row.type] || row.type}</td>
                                   <td className="px-6 py-4 text-right font-bold text-gray-800">{formatCurrency(row.amount)}</td>
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-2 text-gray-600">
                                         {methodIcons[row.paymentMethod]}
                                         <span className="text-xs">{methodLabels[row.paymentMethod]}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-center">{getStatusBadge(row.status)}</td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2">
                                         <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600" onClick={() => handleViewDetail(row)}>
                                            <Eye size={16} />
                                         </Button>
                                         <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-[var(--color-primary)]" onClick={() => handlePrint(row)}>
                                            <Printer size={16} />
                                         </Button>
                                      </div>
                                   </td>
                                </tr>
                             ))
                          ) : (
                             <tr>
                                <td colSpan="8" className="px-6 py-16 text-center text-gray-400">
                                   <div className="flex flex-col items-center">
                                      <FileText size={40} className="text-gray-300 mb-2"/>
                                      <p>Không có dữ liệu phiếu thu</p>
                                   </div>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
                 {/* Pagination (Simple) */}
                 <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <span>Hiển thị {receipts.length} / {pagination.total} bản ghi</span>
                    <div className="flex gap-2">
                       <Button size="sm" disabled={pagination.current === 1} onClick={() => setPagination({...pagination, current: pagination.current - 1})}>Trước</Button>
                       <Button size="sm" variant="outline" className="bg-[var(--color-primary)] text-white border-none">{pagination.current}</Button>
                       <Button size="sm" onClick={() => setPagination({...pagination, current: pagination.current + 1})}>Sau</Button>
                    </div>
                 </div>
              </Card>
           </>
        )}

        {/* --- CONTENT: STATS VIEW --- */}
        {activeTab === 'stats' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 border border-gray-200 shadow-sm">
                 <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <PieChart size={20} className="text-blue-500"/> Tỷ lệ phương thức thanh toán
                 </h3>
                 <div className="h-[300px] flex justify-center">
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
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <Card className="p-6 border border-gray-200 shadow-sm">
                 <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <BarChart size={20} className="text-emerald-500"/> Doanh thu theo ngày
                 </h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000000}M`} />
                          <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
                          <Bar dataKey="amount" fill="#3b9797" radius={[4, 4, 0, 0]} barSize={40} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </Card>
           </div>
        )}

      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedReceipt && (
         <Modal isOpen={detailModalVisible} onClose={() => setDetailModalVisible(false)} title="Chi Tiết Phiếu Thu" size="md">
            <div className="space-y-4 p-1">
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Tổng tiền thu</p>
                  <h2 className="text-3xl font-extrabold text-[var(--color-primary)]">{formatCurrency(selectedReceipt.amount)}</h2>
                  <div className="mt-2 flex justify-center">{getStatusBadge(selectedReceipt.status)}</div>
               </div>

               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                     <p className="text-gray-500 text-xs">Mã phiếu</p>
                     <p className="font-mono font-medium">{selectedReceipt.receiptNumber}</p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-xs">Ngày tạo</p>
                     <p className="font-medium">{new Date(selectedReceipt.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-xs">Học viên</p>
                     <p className="font-medium text-[var(--color-primary)]">{selectedReceipt.student?.fullName}</p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-xs">Lớp học</p>
                     <p className="font-medium">{selectedReceipt.class?.name || "N/A"}</p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-xs">Phương thức</p>
                     <p className="font-medium flex items-center gap-1">
                        {methodIcons[selectedReceipt.paymentMethod]} {methodLabels[selectedReceipt.paymentMethod]}
                     </p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-xs">Người thu</p>
                     <p className="font-medium">{selectedReceipt.createdBy?.fullName || "Admin"}</p>
                  </div>
               </div>

               {selectedReceipt.note && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800 italic">
                     Note: {selectedReceipt.note}
                  </div>
               )}

               <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button variant="outline" className="flex-1" onClick={() => setDetailModalVisible(false)}>Đóng</Button>
                  <Button className="flex-1 bg-[var(--color-primary)] text-white" onClick={() => handlePrint(selectedReceipt)}>
                     <Printer size={16} className="mr-2"/> In Phiếu
                  </Button>
               </div>
            </div>
         </Modal>
      )}

    </div>
  );
};

export default ReceiptManagementPage;