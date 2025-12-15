import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { financeService } from "../../services";
import { DataGrid } from "@mui/x-data-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/common";
import { Badge } from "@components/common";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import toast from "react-hot-toast";

const TuitionPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalPayments: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await financeService.getMyPayments();
      console.log("💰 Payments response:", response);

      // Handle both response formats: { data: [...] } or just [...]
      let paymentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          paymentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          paymentsData = response.data.data;
        } else if (
          typeof response.data === "object" &&
          !Array.isArray(response.data)
        ) {
          // Single payment returned as object, wrap in array
          paymentsData = [response.data];
        }
      }

      console.log(
        "✅ Processed payments:",
        paymentsData,
        "Type:",
        typeof paymentsData
      );
      setPayments(paymentsData);
      calculateStats(paymentsData);
    } catch (error) {
      console.error("❌ Error fetching payments:", error);
      toast.error("Không thể tải lịch sử thanh toán!");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData) => {
    const paid = paymentsData
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pending = paymentsData
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const overdue = paymentsData
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    setStats({
      totalPaid: paid,
      totalPending: pending,
      totalOverdue: overdue,
      totalPayments: paymentsData.length,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return "Không xác định";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const columns = [
    {
      field: "courseName",
      headerName: "Khóa học",
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.course?.name || "N/A",
    },
    {
      field: "amount",
      headerName: "Số tiền",
      width: 150,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(params.value || 0)}
        </span>
      ),
    },
    {
      field: "dueDate",
      headerName: "Hạn thanh toán",
      width: 150,
      valueGetter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString("vi-VN") : "-",
    },
    {
      field: "paidDate",
      headerName: "Ngày thanh toán",
      width: 150,
      valueGetter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString("vi-VN") : "-",
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Badge className={getStatusColor(params.value)}>
          {getStatusLabel(params.value)}
        </Badge>
      ),
    },
    {
      field: "paymentMethod",
      headerName: "Phương thức",
      width: 150,
      valueGetter: (params) => {
        switch (params.value) {
          case "cash":
            return "Tiền mặt";
          case "bank_transfer":
            return "Chuyển khoản";
          case "credit_card":
            return "Thẻ tín dụng";
          default:
            return "-";
        }
      },
    },
  ];

  // Prepare pie chart data
  const pieChartData = [
    { name: "Đã thanh toán", value: stats.totalPaid, color: "#10b981" },
    { name: "Chờ thanh toán", value: stats.totalPending, color: "#f59e0b" },
    { name: "Quá hạn", value: stats.totalOverdue, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lịch Sử Thanh Toán
          </h1>
          <p className="text-lg text-gray-600">
            Danh sách chi tiết các khoản thanh toán
          </p>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all flex items-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Thanh toán
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-t-4 border-t-green-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đã Thanh Toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-yellow-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Chờ Thanh Toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.totalPending)}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Quá Hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalOverdue)}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Giao Dịch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalPayments}
                </p>
                <p className="text-sm text-gray-500 mt-1">Giao dịch</p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {pieChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle>Phân Bố Học Phí</CardTitle>
              <CardDescription>
                Tổng quan về tình trạng thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-red-600">
            <CardHeader>
              <CardTitle>Thống Kê Nhanh</CardTitle>
              <CardDescription>Tổng quan chi tiết</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-gray-700">
                    Đã thanh toán
                  </span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.totalPaid)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium text-gray-700">
                    Chờ thanh toán
                  </span>
                </div>
                <span className="text-xl font-bold text-yellow-600">
                  {formatCurrency(stats.totalPending)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="font-medium text-gray-700">Quá hạn</span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {formatCurrency(stats.totalOverdue)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-gray-700">Tổng cộng</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(
                    stats.totalPaid + stats.totalPending + stats.totalOverdue
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments Table */}
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle>Lịch Sử Thanh Toán</CardTitle>
          <CardDescription>
            Danh sách chi tiết các khoản thanh toán
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={payments}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              loading={loading}
              disableSelectionOnClick
              getRowId={(row) => row._id}
              sx={{
                border: 0,
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f3f4f6",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f9fafb",
                  fontWeight: "bold",
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Chọn khóa học cần thanh toán
            </h3>
            <p className="text-gray-600 mb-6">
              Vui lòng chọn khóa học bạn muốn thanh toán học phí
            </p>

            <div className="space-y-3 mb-6">
              {payments
                .filter((p) => p.status === "pending" || p.remainingAmount > 0)
                .map((payment) => (
                  <div
                    key={payment._id}
                    onClick={() => setSelectedPayment(payment)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPayment?._id === payment._id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {payment.course?.name || "Khóa học"}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Mã: {payment.course?.courseCode || "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(
                            payment.remainingAmount || payment.amount
                          )}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Còn nợ</p>
                      </div>
                    </div>
                  </div>
                ))}

              {payments.filter(
                (p) => p.status === "pending" || p.remainingAmount > 0
              ).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg">
                    Bạn đã thanh toán hết tất cả học phí!
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (selectedPayment) {
                    navigate(`/student/payment/${selectedPayment._id}`);
                  } else {
                    toast.error("Vui lòng chọn khóa học!");
                  }
                }}
                disabled={!selectedPayment}
                className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-all ${
                  selectedPayment
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuitionPage;
