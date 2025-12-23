import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "@components/common";
import { getMyPayments } from "@services/paymentApi";
import {
  CreditCard,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  Receipt,
  DollarSign
} from "lucide-react";

const TuitionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching payments:", err);
      setError("Không thể tải thông tin học phí. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return {
          label: "Đã thanh toán",
          icon: <CheckCircle size={18} />,
          colorClass: "text-[var(--color-secondary)]",
          bgClass: "bg-[var(--color-secondary)]/10"
        };
      case "pending":
        return {
          label: "Chờ thanh toán",
          icon: <Clock size={18} />,
          colorClass: "text-amber-600",
          bgClass: "bg-amber-50"
        };
      case "overdue":
        return {
          label: "Quá hạn",
          icon: <XCircle size={18} />,
          colorClass: "text-[var(--color-danger)]",
          bgClass: "bg-red-50"
        };
      default:
        return {
          label: "Không xác định",
          icon: <AlertCircle size={18} />,
          colorClass: "text-gray-500",
          bgClass: "bg-gray-100"
        };
    }
  };

  if (loading) return <Loading />;

  const totalTuition = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-6 md:p-8">
      {/* Container Full Width */}
      <div className="w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <Wallet size={20} className="text-white" />
                </div>
                Học Phí
              </h1>
              <p className="text-gray-500 text-sm mt-1 ml-12">
                Quản lý lịch sử và trạng thái thanh toán
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
            <AlertCircle className="text-[var(--color-danger)]" size={20} />
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {/* Stats Section - Grid giãn đều */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Tổng học phí</p>
              <h3 className="text-2xl font-bold text-[var(--color-primary)]">
                {totalTuition.toLocaleString("vi-VN")} <span className="text-sm font-normal text-gray-400">₫</span>
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Đã thanh toán</p>
              <h3 className="text-2xl font-bold text-[var(--color-secondary)]">
                {paidAmount.toLocaleString("vi-VN")} <span className="text-sm font-normal text-gray-400">₫</span>
              </h3>
            </div>
            <div className="p-3 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Cần thanh toán</p>
              <h3 className="text-2xl font-bold text-amber-600">
                {pendingAmount.toLocaleString("vi-VN")} <span className="text-sm font-normal text-gray-400">₫</span>
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div>
           <h2 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
             <Receipt size={18} />
             Danh sách khoản thu
           </h2>
           
           {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => {
                const statusConfig = getStatusConfig(payment.status);

                return (
                  <div
                    key={payment._id}
                    // Bỏ border-l-4, giữ shadow và rounded đẹp
                    className={`
                      group bg-white rounded-xl p-6 shadow-[var(--shadow-card)] 
                      hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300
                      border border-gray-100 w-full
                    `}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left: Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-full flex-shrink-0 ${statusConfig.bgClass} ${statusConfig.colorClass}`}>
                          {statusConfig.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="text-base font-bold text-[var(--color-primary)]">
                              {payment.course?.name || "Học phí khóa học"}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusConfig.bgClass} ${statusConfig.colorClass}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            Mã: {payment.course?.code || "N/A"} • Giao dịch: {payment.transactionId || "---"}
                          </p>
                          
                          {/* Mobile View Amounts */}
                          <div className="md:hidden mt-2">
                            <p className="text-lg font-bold text-[var(--color-primary)]">
                              {payment.amount?.toLocaleString("vi-VN")} ₫
                            </p>
                            <p className="text-xs text-gray-500">
                              Hạn: {new Date(payment.dueDate).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amounts & Actions (Desktop) */}
                      <div className="hidden md:flex items-center gap-8">
                         <div className="text-right">
                            <p className="text-xs text-gray-400 mb-0.5">Số tiền</p>
                            <p className="text-lg font-bold text-[var(--color-primary)]">
                              {payment.amount?.toLocaleString("vi-VN")} ₫
                            </p>
                         </div>
                         <div className="text-right min-w-[100px]">
                            <p className="text-xs text-gray-400 mb-0.5">
                              {payment.status === 'paid' ? 'Ngày thanh toán' : 'Hạn thanh toán'}
                            </p>
                            <p className={`text-sm font-medium ${payment.status === 'overdue' ? 'text-[var(--color-danger)]' : 'text-gray-700'}`}>
                              {new Date(payment.status === 'paid' ? payment.paymentDate : payment.dueDate).toLocaleDateString("vi-VN")}
                            </p>
                         </div>
                         
                         {/* Action Button */}
                         <div className="min-w-[120px] flex justify-end">
                           {(payment.status === "pending" || payment.status === "overdue") ? (
                              <button className="px-4 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                <CreditCard size={16} />
                                Thanh toán
                              </button>
                           ) : (
                              <button className="px-4 py-2 bg-gray-50 text-gray-400 text-sm font-medium rounded-lg cursor-default border border-gray-200">
                                Chi tiết
                              </button>
                           )}
                         </div>
                      </div>

                      {/* Mobile Action Button */}
                      <div className="md:hidden w-full pt-3 border-t border-gray-100 mt-2">
                          {(payment.status === "pending" || payment.status === "overdue") && (
                              <button className="w-full py-2.5 bg-[var(--color-secondary)] text-white text-sm font-bold rounded-lg">
                                Thanh toán ngay
                              </button>
                           )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <Receipt size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Chưa có thông tin học phí nào</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default TuitionPage;