import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { Card, Loading, Table, Badge } from "@components/common";
import { DollarSign, Search, Filter, AlertCircle } from "lucide-react";

const TuitionManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tuitionFees, setTuitionFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    classId: "all",
  });

  useEffect(() => {
    loadClasses();
    loadTuitionFees();
  }, [filters]);

  const loadClasses = async () => {
    try {
      const response = await api.get("/api/classes");
      if (response.data.success) {
        setClasses(response.data.data.classes || response.data.data);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const loadTuitionFees = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/accountant/tuition", {
        params: filters,
      });

      if (response.data.success) {
        setTuitionFees(response.data.data.tuitionFees);
      }
    } catch (error) {
      console.error("Error loading tuition fees:", error);
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

  const columns = [
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
      cell: (row) => <span className="text-gray-900">{row.class?.name}</span>,
    },
    {
      header: "Học Phí",
      accessor: "amount",
      cell: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "Đã Nộp",
      accessor: "paidAmount",
      cell: (row) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(row.paidAmount)}
        </span>
      ),
    },
    {
      header: "Còn Lại",
      accessor: "remainingAmount",
      cell: (row) => (
        <span className="text-red-600 font-medium">
          {formatCurrency(row.remainingAmount)}
        </span>
      ),
    },
    {
      header: "Hạn Nộp",
      accessor: "dueDate",
      cell: (row) => {
        const isOverdue = new Date(row.dueDate) < new Date();
        return (
          <div
            className={isOverdue ? "text-red-600 font-medium" : "text-gray-600"}
          >
            {new Date(row.dueDate).toLocaleDateString("vi-VN")}
            {isOverdue && (
              <div className="text-xs flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                Quá hạn
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Trạng Thái",
      accessor: "status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "paid"
              ? "success"
              : row.status === "partial"
              ? "warning"
              : "danger"
          }
        >
          {row.status === "paid" && "Đã thanh toán"}
          {row.status === "partial" && "Một phần"}
          {row.status === "unpaid" && "Chưa thanh toán"}
        </Badge>
      ),
    },
    {
      header: "Thao Tác",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/accountant/tuition/${row._id}`)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Chi tiết
          </button>
          <button
            onClick={() => handleUpdatePayment(row)}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Cập nhật
          </button>
        </div>
      ),
    },
  ];

  const handleUpdatePayment = (tuition) => {
    // TODO: Open modal to update payment
    navigate(
      `/accountant/receipts/create?studentId=${tuition.student._id}&classId=${tuition.class._id}`
    );
  };

  if (loading) {
    return <Loading />;
  }

  const totalAmount = tuitionFees.reduce((sum, t) => sum + t.amount, 0);
  const totalPaid = tuitionFees.reduce((sum, t) => sum + t.paidAmount, 0);
  const totalRemaining = tuitionFees.reduce(
    (sum, t) => sum + t.remainingAmount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="text-green-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản Lý Học Phí
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi và quản lý học phí học viên
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Tổng Học Phí</p>
            <p className="text-xl font-bold text-blue-900 mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">Đã Thu</p>
            <p className="text-xl font-bold text-green-900 mt-1">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        </Card>
        <Card className="bg-red-50">
          <div className="text-center">
            <p className="text-sm text-red-600 font-medium">Còn Lại</p>
            <p className="text-xl font-bold text-red-900 mt-1">
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="text-center">
            <p className="text-sm text-purple-600 font-medium">Tỉ Lệ Thu</p>
            <p className="text-xl font-bold text-purple-900 mt-1">
              {totalAmount > 0
                ? Math.round((totalPaid / totalAmount) * 100)
                : 0}
              %
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
              placeholder="Tên học viên, email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="paid">Đã thanh toán</option>
              <option value="partial">Thanh toán một phần</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Lớp học
            </label>
            <select
              value={filters.classId}
              onChange={(e) =>
                setFilters({ ...filters, classId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả lớp</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Tuition Table */}
      <Card>
        <Table columns={columns} data={tuitionFees} />
      </Card>
    </div>
  );
};

export default TuitionManagementPage;
