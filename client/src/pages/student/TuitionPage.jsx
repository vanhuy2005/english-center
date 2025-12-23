import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Loading } from "@components/common";
import { getMyPayments } from "@services/paymentApi";
import {
  CreditCard,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
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
      console.log("📥 Fetching payments...");

      const data = await getMyPayments();
      console.log("✓ Payments loaded:", data);

      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching payments:", err);
      setError("Lỗi tải thông tin thanh toán");
      setPayments(getMockPayments());
    } finally {
      setLoading(false);
    }
  };

  const getMockPayments = () => [
    {
      _id: "payment_1",
      course: {
        _id: "course1",
        name: "English A1",
        code: "EN-A1",
      },
      amount: 3500000,
      status: "paid",
      paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      paymentMethod: "bank_transfer",
      transactionId: "TXN20241201001",
    },
    {
      _id: "payment_2",
      course: {
        _id: "course2",
        name: "English A2",
        code: "EN-A2",
      },
      amount: 3500000,
      status: "pending",
      paymentDate: null,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={20} className="text-green-600" />;
      case "pending":
        return <Clock size={20} className="text-yellow-600" />;
      case "overdue":
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-50 border-l-4 border-l-green-600";
      case "pending":
        return "bg-yellow-50 border-l-4 border-l-yellow-600";
      case "overdue":
        return "bg-red-50 border-l-4 border-l-red-600";
      default:
        return "bg-gray-50 border-l-4 border-l-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Chờ thanh toán";
      case "overdue":
        return "Quá hạn";
      default:
        return status;
    }
  };

  if (loading) {
    return <Loading />;
  }

  const totalTuition = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={32} className="text-blue-600" />
                Học Phí
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi thanh toán
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng Học Phí</p>
              <h3 className="text-3xl font-bold mt-2">
                {totalTuition.toLocaleString("vi-VN")}
              </h3>
              <p className="text-blue-100 text-xs mt-1">VND</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Đã Thanh Toán
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {paidAmount.toLocaleString("vi-VN")}
              </h3>
              <p className="text-green-100 text-xs mt-1">VND</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                Chờ Thanh Toán
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {pendingAmount.toLocaleString("vi-VN")}
              </h3>
              <p className="text-orange-100 text-xs mt-1">VND</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Payments List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card
                key={payment._id}
                className={`${getStatusColor(
                  payment.status
                )} p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">
                    {getStatusIcon(payment.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payment.course?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {payment.course?.code}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>

                    {/* Payment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Học Phí</p>
                        <p className="text-lg font-bold text-gray-900">
                          {(payment.amount || 0).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Hạn Thanh Toán</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(payment.dueDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                      {payment.status === "paid" && (
                        <>
                          <div>
                            <p className="text-xs text-gray-600">
                              Ngày Thanh Toán
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(payment.paymentDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">
                              Mã Giao Dịch
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {payment.transactionId}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {payment.status === "pending" && (
                    <button className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                      Thanh Toán
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">
              Không có thông tin thanh toán nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TuitionPage;
