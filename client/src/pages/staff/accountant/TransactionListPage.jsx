import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Loading } from "@components/common";
import { receiptService } from "@services/receiptService";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
} from "lucide-react";

const TransactionListPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.current, statusFilter]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (statusFilter) {
        params.paymentMethod = statusFilter;
      }

      if (searchText) {
        params.search = searchText;
      }

      // Use receiptService to fetch actual receipts
      const response = await receiptService.getReceipts(params);
      // Backend returns { receipts: [...], total, currentPage, totalPages }
      const data = response.receipts || response.data || [];
      const total = response.total || data.length;

      setTransactions(
        data.map((receipt) => ({
          _id: receipt._id,
          receiptNumber: receipt.receiptNumber || receipt._id,
          student: receipt.student,
          course: receipt.course,
          amount: receipt.amount,
          status: receipt.status || "pending",
          createdAt: receipt.createdAt,
          paymentMethod: receipt.paymentMethod,
        }))
      );

      setPagination((prev) => ({
        ...prev,
        total,
      }));
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, statusFilter, searchText]);

  const handleSearch = useCallback(async () => {
    setSearching(true);
    setPagination((prev) => ({ ...prev, current: 1 }));
    await fetchTransactions();
    setSearching(false);
  }, [fetchTransactions]);

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }

    try {
      const headers = [
        "Mã GD",
        "Học Viên",
        "Khóa Học",
        "Số Tiền",
        "Trạng Thái",
        "Ngày",
      ];

      const rows = transactions.map((t) => [
        t.receiptNumber,
        t.student?.fullName || "N/A",
        t.course?.name || "N/A",
        t.amount,
        t.status,
        formatDate(t.createdAt),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
            )
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `Giao-dich-${new Date().getTime()}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      alert("Không thể xuất dữ liệu");
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

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  if (loading && transactions.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Danh Sách Phiếu Thu
        </h1>
        <p className="text-gray-600 mt-1">Quản lý các phiếu thu được tạo</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-gray-600 text-sm font-medium">Tổng số phiếu</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">
            {pagination.total}
          </h3>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-gray-600 text-sm font-medium">Tổng tiền đã thu</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(
              transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
            )}
          </h3>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <p className="text-gray-600 text-sm font-medium">Chờ thanh toán</p>
          <h3 className="text-3xl font-bold text-yellow-600 mt-2">
            {transactions.filter((t) => t.status === "pending").length}
          </h3>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-gray-600 text-sm font-medium">Quá hạn</p>
          <h3 className="text-3xl font-bold text-red-600 mt-2">
            {transactions.filter((t) => t.status === "overdue").length}
          </h3>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm theo mã, học viên, khóa học..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
              >
                {searching ? "Đang tìm..." : "Tìm"}
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất Cả Trạng Thái</option>
              <option value="paid">Đã Thanh Toán</option>
              <option value="pending">Chờ Thanh Toán</option>
              <option value="partial">Thanh Toán Một Phần</option>
              <option value="overdue">Quá Hạn</option>
            </select>

            {/* Export */}
            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium border border-green-200"
            >
              <Download size={18} />
              Xuất Excel
            </button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
          </div>
        ) : (
          <>
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
                      Khóa Học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số Tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.receiptNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.student?.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.course?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Hiển thị {(pagination.current - 1) * pagination.pageSize + 1}{" "}
                đến{" "}
                {Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total
                )}{" "}
                trên {pagination.total} giao dịch
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: Math.max(1, prev.current - 1),
                    }))
                  }
                  disabled={pagination.current === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page indicators */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              current: page,
                            }))
                          }
                          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                            pagination.current === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: Math.min(totalPages, prev.current + 1),
                    }))
                  }
                  disabled={pagination.current === totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default TransactionListPage;
