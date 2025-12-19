import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import api from "@services/api";
import { receiptService } from "@services/receiptService";
import { Card, Loading } from "@components/common";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  Receipt,
  Calendar,
  Users,
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

      // Fetch 5 recent receipts specifically for dashboard
      let recentReceipts = [];
      try {
        const recentResponse = await receiptService.getRecentReceipts();
        recentReceipts = recentResponse.receipts || [];
        console.log("💰 Recent receipts loaded:", recentReceipts);
      } catch (recentError) {
        console.warn("Failed to load recent receipts:", recentError);
      }

      // Fetch receipts from the receipts API with proper population (for stats)
      const response = await receiptService.getReceipts({
        limit: 10,
        sort: "-createdAt",
      });

      const receipts = response.data || [];

      // Calculate stats from receipts
      const totalRevenue = receipts.reduce(
        (sum, r) => sum + (r.amount || 0),
        0
      );
      const monthRevenue = receipts
        .filter((r) => {
          const receiptDate = new Date(r.createdAt);
          const today = new Date();
          return (
            receiptDate.getMonth() === today.getMonth() &&
            receiptDate.getFullYear() === today.getFullYear()
          );
        })
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      setDashboardData((prev) => ({
        ...prev,
        stats: {
          totalRevenue,
          monthRevenue,
          pendingPayments: receipts.filter((r) => r.status === "pending")
            .length,
          overduePayments: receipts.filter((r) => r.status === "overdue")
            .length,
        },
        recentTransactions: recentReceipts.map((r) => ({
          _id: r._id,
          transactionCode: r.receiptNumber || r._id,
          student: r.student,
          class: r.class,
          amount: r.amount,
          status: r.status || "pending",
          createdAt: r.createdAt,
          paymentMethod: r.paymentMethod,
          createdBy: r.createdBy,
        })),
      }));
    } catch (error) {
      console.warn("Failed to load dashboard data:", error);
      setError("error");
      // Keep default state
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
    recentTransactions = [],
    revenueTrend,
    paymentStatus,
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tổng Quan Kế Toán
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

      {/* Error Alert */}
      {error === "endpoint_not_found" && (
        <Card className="border-l-4 border-blue-500 bg-blue-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-blue-600" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900">
                Chế độ hiển thị mẫu
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                API endpoint chưa được triển khai. Dữ liệu hiển thị là dữ liệu
                mẫu.
              </p>
            </div>
          </div>
        </Card>
      )}

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
              <p className="text-green-100 text-xs mt-1">Toàn thời gian</p>
            </div>
            <DollarSign size={48} className="text-green-200 opacity-80" />
          </div>
        </Card>

        {/* Month Revenue */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Doanh Thu Tháng
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {formatCurrency(stats.monthRevenue)}
              </h3>
              <p className="text-blue-100 text-xs mt-1">Tháng này</p>
            </div>
            <TrendingUp size={48} className="text-blue-200 opacity-80" />
          </div>
        </Card>

        {/* Pending Payments */}
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Chờ Thanh Toán
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.pendingPayments}
              </h3>
              <p className="text-yellow-100 text-xs mt-1">Giao dịch</p>
            </div>
            <Clock size={48} className="text-yellow-200 opacity-80" />
          </div>
        </Card>

        {/* Overdue Payments */}
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Quá Hạn</p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.overduePayments}
              </h3>
              <p className="text-red-100 text-xs mt-1">Giao dịch</p>
            </div>
            <AlertCircle size={48} className="text-red-200 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Xu Hướng Doanh Thu
            </h3>
          </div>
          <LineChart data={revenueTrend} height={250} />
        </Card>

        {/* Payment Status */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Trạng Thái Thanh Toán
            </h3>
          </div>
          <PieChart data={paymentStatus} height={250} />
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Giao Dịch Gần Đây
          </h3>
          <button
            onClick={() => navigate("/accountant/transactions")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem Tất Cả →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã GD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học Viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp Học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương Thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.transactionCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.student?.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.class?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {transaction.paymentMethod === "cash"
                          ? "Tiền mặt"
                          : transaction.paymentMethod === "bank_transfer"
                          ? "Chuyển khoản"
                          : transaction.paymentMethod === "credit_card"
                          ? "Thẻ tín dụng"
                          : transaction.paymentMethod === "momo"
                          ? "MoMo"
                          : "Khác"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không có giao dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao Tác Nhanh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/accountant/transactions")}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Receipt className="text-blue-600 mb-2" size={28} />
            <span className="text-sm font-medium text-blue-900">Giao Dịch</span>
          </button>
          <button
            onClick={() => navigate("/accountant/students")}
            className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Users className="text-green-600 mb-2" size={28} />
            <span className="text-sm font-medium text-green-900">
              Tình Hình Học Phí
            </span>
          </button>
          <button
            onClick={() => navigate("/accountant/receipts")}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Receipt className="text-purple-600 mb-2" size={28} />
            <span className="text-sm font-medium text-purple-900">
              Biên Lai
            </span>
          </button>
          <button
            onClick={() => navigate("/accountant/reports")}
            className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <TrendingUp className="text-orange-600 mb-2" size={28} />
            <span className="text-sm font-medium text-orange-900">Báo Cáo</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AccountantDashboardPage;
