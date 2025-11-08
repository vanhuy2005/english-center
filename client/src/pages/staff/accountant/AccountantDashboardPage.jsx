import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import api from "@services/api";
import { Card, Loading } from "@components/common";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Receipt,
  Users,
  CreditCard,
  FileText,
  Calendar,
} from "lucide-react";
import { LineChart, DoughnutChart, BarChart } from "@components/charts";

const AccountantDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRevenue: 0,
      pendingPayments: 0,
      pendingAmount: 0,
      totalDebt: 0,
      paymentRate: 0,
    },
    recentReceipts: [],
    revenueTrend: { labels: [], datasets: [] },
    paymentStatusDistribution: { labels: [], datasets: [] },
    pendingPaymentsList: [],
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/accountant/dashboard");

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        console.error("API returned success=false:", response.data);
        setDashboardData({
          stats: {
            totalRevenue: 0,
            pendingPayments: 0,
            pendingAmount: 0,
            totalDebt: 0,
            paymentRate: 0,
          },
          recentReceipts: [],
          revenueTrend: { labels: [], datasets: [{ data: [] }] },
          paymentStatusDistribution: { labels: [], datasets: [{ data: [] }] },
          pendingPaymentsList: [],
        });
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      // Set default empty data on error
      setDashboardData({
        stats: {
          totalRevenue: 0,
          pendingPayments: 0,
          pendingAmount: 0,
          totalDebt: 0,
          paymentRate: 0,
        },
        recentReceipts: [],
        revenueTrend: { labels: [], datasets: [{ data: [] }] },
        paymentStatusDistribution: { labels: [], datasets: [{ data: [] }] },
        pendingPaymentsList: [],
      });
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

  if (loading) {
    return <Loading />;
  }

  const {
    stats,
    recentReceipts,
    revenueTrend,
    paymentStatusDistribution,
    pendingPaymentsList,
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tổng Quan Tài Chính
          </h1>
          <p className="text-gray-600 mt-1">
            Chào mừng, {user?.profile?.fullName || "Nhân viên kế toán"}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>{new Date().toLocaleDateString("vi-VN")}</div>
          <div>
            {new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Tổng Doanh Thu
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {formatCurrency(stats.totalRevenue)}
              </h3>
              <p className="text-green-100 text-xs mt-1">Đã thu</p>
            </div>
            <DollarSign size={48} className="text-green-200 opacity-80" />
          </div>
        </Card>

        {/* Pending Payments */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                Chờ Thanh Toán
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.pendingPayments}
              </h3>
              <p className="text-orange-100 text-xs mt-1">
                {formatCurrency(stats.pendingAmount)}
              </p>
            </div>
            <CreditCard size={48} className="text-orange-200 opacity-80" />
          </div>
        </Card>

        {/* Total Debt */}
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Tổng Công Nợ</p>
              <h3 className="text-2xl font-bold mt-2">
                {formatCurrency(stats.totalDebt)}
              </h3>
              <p className="text-red-100 text-xs mt-1">Chưa thu</p>
            </div>
            <AlertCircle size={48} className="text-red-200 opacity-80" />
          </div>
        </Card>

        {/* Payment Rate */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tỉ Lệ Thu</p>
              <h3 className="text-3xl font-bold mt-2">{stats.paymentRate}%</h3>
              <p className="text-blue-100 text-xs mt-1">Đã nộp học phí</p>
            </div>
            <TrendingUp size={48} className="text-blue-200 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Xu Hướng Doanh Thu
            </h3>
          </div>
          <LineChart data={revenueTrend} height={250} />
        </Card>

        {/* Payment Status Distribution */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Phân Bố Trạng Thái Thanh Toán
            </h3>
          </div>
          <DoughnutChart data={paymentStatusDistribution} height={250} />
        </Card>
      </div>

      {/* Recent Receipts & Pending Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Receipts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Phiếu Thu Gần Đây
            </h3>
            <button
              onClick={() => navigate("/accountant/receipts")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem Tất Cả →
            </button>
          </div>
          <div className="space-y-3">
            {recentReceipts.length > 0 ? (
              recentReceipts.map((receipt) => (
                <div
                  key={receipt._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(`/accountant/receipts/${receipt._id}`)
                  }
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {receipt.receiptNumber}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Học viên ID:{" "}
                      {receipt.student?.toString().slice(-6) || "N/A"} - Khóa
                      học ID: {receipt.class?.toString().slice(-6) || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(receipt.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(receipt.amount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Không có phiếu thu nào
              </p>
            )}
          </div>
        </Card>

        {/* Pending Payments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thanh Toán Chờ Xử Lý
            </h3>
            <button
              onClick={() => navigate("/accountant/payments")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem Tất Cả →
            </button>
          </div>
          <div className="space-y-3">
            {pendingPaymentsList.length > 0 ? (
              pendingPaymentsList.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer"
                  onClick={() => navigate("/accountant/payments")}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Học viên ID:{" "}
                      {payment.student?.toString().slice(-6) || "N/A"}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Khóa học ID:{" "}
                      {payment.class?.toString().slice(-6) || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Hạn:{" "}
                      {new Date(payment.dueDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(payment.amount)}
                    </p>
                    <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full mt-1 inline-block">
                      Chờ xử lý
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Không có thanh toán chờ xử lý
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao Tác Nhanh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/accountant/receipts/create")}
            className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Receipt className="text-green-600 mb-2" size={28} />
            <span className="text-sm font-medium text-green-900">
              Tạo Phiếu Thu
            </span>
          </button>
          <button
            onClick={() => navigate("/accountant/tuition")}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <DollarSign className="text-blue-600 mb-2" size={28} />
            <span className="text-sm font-medium text-blue-900">
              Quản Lý Học Phí
            </span>
          </button>
          <button
            onClick={() => navigate("/accountant/reports/revenue")}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <FileText className="text-purple-600 mb-2" size={28} />
            <span className="text-sm font-medium text-purple-900">Báo Cáo</span>
          </button>
          <button
            onClick={() => navigate("/accountant/students")}
            className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <Users className="text-orange-600 mb-2" size={28} />
            <span className="text-sm font-medium text-orange-900">Công Nợ</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AccountantDashboardPage;
