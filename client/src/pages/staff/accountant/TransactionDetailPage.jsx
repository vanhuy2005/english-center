import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Loading } from "@components/common";
import { receiptService } from "@services/receiptService";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  Download,
  AlertCircle,
  Clock,
} from "lucide-react";

const TransactionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Only fetch if id exists
    if (id) {
      fetchTransactionDetails();
    } else {
      // Redirect to transactions list if no id provided
      navigate("/accountant/transactions");
    }
  }, [id, navigate]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch Receipt directly using receiptService
      const data = await receiptService.getReceiptById(id);

      if (!data) {
        setError("Không tìm thấy giao dịch");
        return;
      }

      setTransaction(data);
    } catch (error) {
      console.error("Error fetching transaction:", error);

      // More detailed error handling
      if (error.response?.status === 404) {
        setError("Giao dịch không tồn tại");
      } else if (error.response?.status === 401) {
        setError("Vui lòng đăng nhập lại");
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Không thể tải chi tiết giao dịch"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;

    try {
      setDeleting(true);
      // Use accountant-specific endpoint
      await api.delete(`/api/staff/accountant/transactions/${id}`);
      navigate("/accountant/transactions");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Không thể xóa giao dịch");
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "partial":
        return "bg-blue-100 text-blue-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      paid: "Đã thanh toán",
      pending: "Chờ thanh toán",
      partial: "Thanh toán một phần",
      overdue: "Quá hạn",
    };
    return labels[status] || status;
  };

  // Guard: if no id, return loading (will redirect via useEffect)
  if (!id) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  if (error || !transaction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/accountant/transactions")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Quay Lại
          </button>
        </div>
        <Card className="border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-semibold text-red-900">Lỗi</h3>
              <p className="text-sm text-red-700 mt-1">
                {error || "Không tìm thấy giao dịch"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/accountant/transactions")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Quay Lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi Tiết Giao Dịch
            </h1>
            <p className="text-gray-600 mt-1">
              Mã: {transaction.receiptNumber || transaction._id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/accountant/edit-receipt/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 size={18} />
            Chỉnh Sửa
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
          >
            <Trash2 size={18} />
            {deleting ? "Đang Xóa..." : "Xóa"}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Status Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Trạng Thái Giao Dịch
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  transaction.status
                )}`}
              >
                {getStatusLabel(transaction.status)}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Ngày Tạo</span>
                <span className="font-semibold">
                  {formatDate(transaction.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Ngày Thanh Toán Dự Kiến</span>
                <span className="font-semibold">
                  {transaction.dueDate
                    ? formatDate(transaction.dueDate)
                    : "Chưa xác định"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Ghi Chú</span>
                <span className="font-semibold">
                  {transaction.notes || "Không có"}
                </span>
              </div>
            </div>
          </Card>

          {/* Student Information */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông Tin Học Viên
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <User size={20} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Tên Học Viên</p>
                  <p className="font-semibold text-gray-900">
                    {transaction.student?.fullName || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Phone size={20} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Số Điện Thoại</p>
                  <p className="font-semibold text-gray-900">
                    {transaction.student?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Mail size={20} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">
                    {transaction.student?.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MapPin size={20} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Địa Chỉ</p>
                  <p className="font-semibold text-gray-900">
                    {transaction.student?.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Course Information */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông Tin Khóa Học
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <BookOpen size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Tên Khóa Học</p>
                  <p className="font-semibold text-gray-900">
                    {transaction.course?.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Calendar size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Thời Gian Học</p>
                  <p className="font-semibold text-gray-900">
                    {transaction.course?.duration || "N/A"} tuần
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <DollarSign
                  size={20}
                  className="text-green-600 flex-shrink-0"
                />
                <div>
                  <p className="text-sm text-gray-600">Học Phí</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(transaction.course?.price)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Payment Summary */}
        <div className="space-y-6">
          {/* Payment Amount */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Số Tiền Thanh Toán
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {formatCurrency(transaction.amount)}
              </h3>
            </div>
          </Card>

          {/* Remaining Amount */}
          {transaction.status === "partial" && (
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div>
                <p className="text-orange-100 text-sm font-medium">Còn Lại</p>
                <h3 className="text-3xl font-bold mt-2">
                  {formatCurrency(
                    (transaction.course?.price || 0) - (transaction.amount || 0)
                  )}
                </h3>
              </div>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Hình Thức Thanh Toán
            </h3>
            <p className="text-center text-2xl font-bold text-gray-700">
              {transaction.paymentMethod || "Chuyển khoản"}
            </p>
          </Card>

          {/* Timeline */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sự Kiện
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                  <div className="w-0.5 h-12 bg-gray-200 mt-1"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Giao dịch được tạo
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>
              {transaction.status === "paid" && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Giao dịch hoàn tất
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.paidAt
                        ? formatDate(transaction.paidAt)
                        : formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              )}
              {transaction.status === "overdue" && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Quá hạn
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.dueDate
                        ? formatDate(transaction.dueDate)
                        : "Không xác định"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Download Receipt */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium">
            <Download size={20} />
            Tải Biên Lai
          </button>
        </div>
      </div>

      {/* Related Transactions */}
      {transaction.class && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Giao Dịch Khác Của Lớp
          </h2>
          <p className="text-gray-500">
            Lớp {transaction.class?.name || "N/A"} có các giao dịch liên quan
          </p>
        </Card>
      )}
    </div>
  );
};

export default TransactionDetailPage;
