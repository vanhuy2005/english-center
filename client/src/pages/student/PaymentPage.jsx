import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { financeService } from "../../services";
import apiClient from "@services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@components/common";
import { Button } from "@components/common";
import { CreditCard, Building2, Smartphone, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await financeService.getMyPayments();
      const paymentData = response.data?.find(p => p._id === id);
      if (paymentData) {
        setPayment(paymentData);
        setAmount(paymentData.remainingAmount || paymentData.amount);
      } else {
        toast.error("Không tìm thấy thông tin thanh toán!");
        navigate("/student/tuition");
      }
    } catch (error) {
      toast.error("Không thể tải thông tin thanh toán!");
      navigate("/student/tuition");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast.error("Vui lòng nhập số tiền thanh toán!");
      return;
    }

    if (amount > (payment.remainingAmount || payment.amount)) {
      toast.error("Số tiền thanh toán vượt quá số tiền còn nợ!");
      return;
    }

    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Call actual payment API
      // await apiClient.post(`/finance/${id}/payment`, {
      //   paidAmount: amount,
      //   paymentMethod: paymentMethod
      // });

      toast.success("Thanh toán thành công!");
      navigate("/student/tuition");
    } catch (error) {
      toast.error("Thanh toán thất bại! Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh Toán Học Phí
          </h1>
          <p className="text-gray-600">
            Hoàn tất thanh toán để tiếp tục học tập
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Khóa Học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Khóa học:</span>
                  <span className="font-semibold">{payment.course?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã khóa học:</span>
                  <span className="font-semibold">{payment.course?.courseCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng học phí:</span>
                  <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(payment.paidAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-900 font-semibold">Còn nợ:</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(payment.remainingAmount || payment.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Phương Thức Thanh Toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-gray-600">
                        Chuyển khoản qua Internet Banking
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("momo")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "momo"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-pink-600" />
                    <div>
                      <p className="font-semibold">Ví MoMo</p>
                      <p className="text-sm text-gray-600">
                        Thanh toán qua ví điện tử MoMo
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("credit_card")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "credit_card"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold">Thẻ tín dụng/Ghi nợ</p>
                      <p className="text-sm text-gray-600">
                        Visa, Mastercard, JCB
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amount Input */}
            <Card>
              <CardHeader>
                <CardTitle>Số Tiền Thanh Toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số tiền"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAmount(payment.remainingAmount || payment.amount)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
                    >
                      Thanh toán toàn bộ
                    </button>
                    <button
                      onClick={() => setAmount((payment.remainingAmount || payment.amount) / 2)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
                    >
                      Thanh toán 50%
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tóm Tắt Thanh Toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-semibold">{formatCurrency(amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí giao dịch:</span>
                    <span className="font-semibold">0 ₫</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-semibold">Tổng cộng:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(amount || 0)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing || !amount}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Xác nhận thanh toán
                    </span>
                  )}
                </Button>

                <button
                  onClick={() => navigate("/student/tuition")}
                  className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Quay lại
                </button>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Bằng việc thanh toán, bạn đồng ý với{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Điều khoản dịch vụ
                    </a>{" "}
                    của chúng tôi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
