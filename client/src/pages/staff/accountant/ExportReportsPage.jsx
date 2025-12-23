import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  PieChart, 
  DollarSign, 
  Receipt, 
  RotateCcw,
  History
} from "lucide-react";
import { Card, Button, Loading } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const ExportReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    reportType: "revenue",
  });

  const reportTypes = [
    { value: "revenue", label: "Báo cáo Doanh thu", icon: <DollarSign size={24} />, desc: "Tổng hợp doanh thu, lợi nhuận", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { value: "debt", label: "Báo cáo Công nợ", icon: <PieChart size={24} />, desc: "Theo dõi học phí chưa đóng", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
    { value: "receipts", label: "Danh sách Phiếu thu", icon: <Receipt size={24} />, desc: "Chi tiết lịch sử giao dịch", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { value: "refunds", label: "Báo cáo Hoàn tiền", icon: <RotateCcw size={24} />, desc: "Các khoản đã hoàn trả", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  ];

  const handleExport = async () => {
    if (!filters.dateFrom || !filters.dateTo) {
        toast.error("Vui lòng chọn khoảng thời gian báo cáo");
        return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/staff/accountant/reports/export",
        filters,
        { responseType: "blob" }
      );

      const typeLabel = reportTypes.find(t => t.value === filters.reportType)?.label || "bao_cao";
      const fileName = `${typeLabel}_${filters.dateFrom}_${filters.dateTo}.xlsx`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất báo cáo");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <FileText className="w-6 h-6 text-white" />
               </div>
               Xuất Báo Cáo
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Trích xuất dữ liệu tài chính ra định dạng Excel để lưu trữ và phân tích
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: SELECTION FORM */}
            <Card className="lg:col-span-2 shadow-md border-gray-200">
                <div className="p-6 space-y-8">
                    
                    {/* Report Type Selection */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileSpreadsheet className="text-[var(--color-secondary)]" size={20}/> 1. Chọn Loại Báo Cáo
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {reportTypes.map((type) => (
                                <div 
                                    key={type.value}
                                    onClick={() => setFilters({...filters, reportType: type.value})}
                                    className={`
                                        cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden group flex items-start gap-4
                                        ${filters.reportType === type.value 
                                            ? `border-[var(--color-secondary)] bg-[var(--color-secondary)]/5 ring-1 ring-[var(--color-secondary)]` 
                                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    <div className={`p-3 rounded-lg ${type.bg} ${type.color}`}>
                                        {type.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${filters.reportType === type.value ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {type.label}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{type.desc}</p>
                                    </div>
                                    
                                    {filters.reportType === type.value && (
                                        <div className="absolute top-3 right-3 text-[var(--color-secondary)]">
                                            <CheckCircle size={18} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="border-t border-gray-100"></div>

                    {/* Date Range Selection */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="text-[var(--color-secondary)]" size={20}/> 2. Chọn Thời Gian
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Từ ngày</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all text-gray-700 font-medium cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Đến ngày</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all text-gray-700 font-medium cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button
                            onClick={handleExport}
                            className="w-full py-4 bg-[var(--color-primary)] hover:bg-[#1a2e4d] text-white shadow-lg flex items-center justify-center gap-3 text-lg font-semibold rounded-xl transition-all active:scale-[0.99]"
                            loading={loading}
                            disabled={!filters.dateFrom || !filters.dateTo}
                        >
                            <Download size={24} />
                            Tải Xuống Báo Cáo Ngay
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                            <CheckCircle size={12} /> File báo cáo định dạng chuẩn .xlsx tương thích Excel/Google Sheets
                        </p>
                    </div>
                </div>
            </Card>

            {/* RIGHT COLUMN: INFO & HISTORY */}
            <div className="space-y-6">
                <Card className="bg-[#e3f2fd] border border-blue-200 shadow-sm">
                    <div className="p-6">
                        <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-4 text-lg">
                            <AlertCircle size={20}/> Lưu ý quan trọng
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-3 list-disc list-inside leading-relaxed">
                            <li>Dữ liệu báo cáo được cập nhật <strong>theo thời gian thực</strong> từ hệ thống.</li>
                            <li>Nếu khoảng thời gian quá lớn, quá trình xuất báo cáo có thể mất vài phút.</li>
                            <li>Vui lòng kiểm tra kỹ <strong>bộ lọc ngày</strong> để tránh xuất dữ liệu rỗng.</li>
                        </ul>
                    </div>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                    <div className="p-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <History size={20} className="text-gray-500"/> Lịch sử xuất gần đây
                        </h4>
                        
                        {/* Placeholder for history - can be dynamic later */}
                        <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                            <div className="p-3 bg-gray-100 rounded-full mb-3">
                                <FileSpreadsheet size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Chưa có lịch sử xuất báo cáo</p>
                            <p className="text-xs text-gray-400 mt-1">Các file đã tải sẽ hiển thị tại đây</p>
                        </div>
                    </div>
                </Card>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ExportReportsPage;