import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { Card, Loading, Table, Badge, Button } from "@components/common";
import { Receipt, Search, Filter, Plus, Download, Eye } from "lucide-react";

const PaymentReceiptsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    loadReceipts();
  }, [filters]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/accountant/receipts", {
        params: filters,
      });

      if (response.data.success) {
        setReceipts(response.data.data.receipts);
      }
    } catch (error) {
      console.error("Error loading receipts:", error);
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

  const handlePrintReceipt = (receiptId) => {
    // TODO: Implement print functionality
    window.open(`/accountant/receipts/${receiptId}/print`, "_blank");
  };

  const columns = [
    {
      header: "Số Phiếu",
      accessor: "receiptNumber",
      cell: (row) => (
        <span className="font-mono font-semibold text-blue-600">
          {row.receiptNumber}
        </span>
      ),
    },
    {
      header: "Học Viên",
      accessor: "student",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.student?.fullName}
          </div>
          <div className="text-sm text-gray-500">{row.student?.email}</div>
        </div>
      ),
    },
    {
      header: "Lớp",
      accessor: "class",
      cell: (row) => (
        <span className="text-gray-900">{row.class?.name || "N/A"}</span>
      ),
    },
    {
      header: "Số Tiền",
      accessor: "amount",
      cell: (row) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "Phương Thức",
      accessor: "paymentMethod",
      cell: (row) => (
        <Badge variant="secondary">
          {row.paymentMethod === "cash" && "Tiền mặt"}
          {row.paymentMethod === "bank_transfer" && "Chuyển khoản"}
          {row.paymentMethod === "card" && "Thẻ"}
          {row.paymentMethod === "momo" && "MoMo"}
        </Badge>
      ),
    },
    {
      header: "Ngày Tạo",
      accessor: "createdAt",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {new Date(row.createdAt).toLocaleDateString("vi-VN")}
          <br />
          {new Date(row.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },
    {
      header: "Người Tạo",
      accessor: "createdBy",
      cell: (row) => (
        <span className="text-sm text-gray-600">{row.createdBy?.fullName}</span>
      ),
    },
    {
      header: "Trạng Thái",
      accessor: "status",
      cell: (row) => (
        <Badge variant={row.status === "voided" ? "danger" : "success"}>
          {row.status === "voided" ? "Đã hủy" : "Hợp lệ"}
        </Badge>
      ),
    },
    {
      header: "Thao Tác",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/accountant/receipts/${row._id}`)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Eye size={14} />
            Xem
          </button>
          <button
            onClick={() => handlePrintReceipt(row._id)}
            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
          >
            <Download size={14} />
            In
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phiếu Thu</h1>
            <p className="text-gray-600 mt-1">
              Quản lý và tra cứu phiếu thu học phí
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/accountant/receipts/create")}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo Phiếu Thu Mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Tổng Phiếu</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {receipts.length}
            </p>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">Tổng Số Tiền</p>
            <p className="text-xl font-bold text-green-900 mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="text-center">
            <p className="text-sm text-purple-600 font-medium">Hôm Nay</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {
                receipts.filter(
                  (r) =>
                    new Date(r.createdAt).toDateString() ===
                    new Date().toDateString()
                ).length
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search size={16} className="inline mr-1" />
              Tìm kiếm
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Số phiếu, tên học viên..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Receipts Table */}
      <Card>
        <Table columns={columns} data={receipts} />
      </Card>
    </div>
  );
};

export default PaymentReceiptsPage;
