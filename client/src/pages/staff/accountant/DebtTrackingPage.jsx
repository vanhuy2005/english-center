import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { Card, Loading, Table, Badge, Button } from "@components/common";
import { AlertCircle, Send, Download } from "lucide-react";

const DebtTrackingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [debtors, setDebtors] = useState([]);

  useEffect(() => {
    loadDebtors();
  }, []);

  const loadDebtors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/accountant/reports/debt");

      if (response.success) {
        setDebtors(response.data?.debtors || []);
      }
    } catch (error) {
      console.error("Error loading debtors:", error);
      setDebtors([]);
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

  const handleSendReminder = async (student) => {
    if (window.confirm(`Gửi nhắc nhở đến ${student.fullName}?`)) {
      // TODO: Implement send reminder
      alert("Đã gửi nhắc nhở thành công!");
    }
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
          <div className="text-sm text-gray-500">{row.student?.phone}</div>
        </div>
      ),
    },
    {
      header: "Lớp",
      accessor: "class",
      cell: (row) => <span className="text-gray-900">{row.class?.name}</span>,
    },
    {
      header: "Tổng Học Phí",
      accessor: "totalAmount",
      cell: (row) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(row.totalAmount)}
        </span>
      ),
    },
    {
      header: "Đã Nộp",
      accessor: "paidAmount",
      cell: (row) => (
        <span className="text-green-600">{formatCurrency(row.paidAmount)}</span>
      ),
    },
    {
      header: "Còn Nợ",
      accessor: "debtAmount",
      cell: (row) => (
        <span className="font-semibold text-red-600">
          {formatCurrency(row.debtAmount)}
        </span>
      ),
    },
    {
      header: "Hạn Nộp",
      accessor: "dueDate",
      cell: (row) => {
        const isOverdue = row.daysOverdue > 0;
        return (
          <div className={isOverdue ? "text-red-600" : "text-gray-600"}>
            {new Date(row.dueDate).toLocaleDateString("vi-VN")}
            {isOverdue && (
              <div className="text-xs font-medium mt-1">
                Quá hạn {row.daysOverdue} ngày
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Mức Độ",
      accessor: "priority",
      cell: (row) => {
        const level =
          row.daysOverdue > 30
            ? "danger"
            : row.daysOverdue > 7
            ? "warning"
            : "secondary";
        const text =
          row.daysOverdue > 30
            ? "Nghiêm trọng"
            : row.daysOverdue > 7
            ? "Cảnh báo"
            : "Bình thường";
        return <Badge variant={level}>{text}</Badge>;
      },
    },
    {
      header: "Thao Tác",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleSendReminder(row.student)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Send size={14} />
            Nhắc nhở
          </button>
          <button
            onClick={() =>
              navigate(
                `/accountant/receipts/create?studentId=${row.student._id}&classId=${row.class._id}`
              )
            }
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Thu tiền
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  const totalDebt = debtors.reduce((sum, d) => sum + d.debtAmount, 0);
  const criticalDebtors = debtors.filter((d) => d.daysOverdue > 30).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Theo Dõi Công Nợ
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý học viên chưa nộp đủ học phí
            </p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Download size={18} />
          Xuất Báo Cáo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50">
          <div className="text-center">
            <p className="text-sm text-red-600 font-medium">Tổng Công Nợ</p>
            <p className="text-2xl font-bold text-red-900 mt-2">
              {formatCurrency(totalDebt)}
            </p>
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="text-center">
            <p className="text-sm text-orange-600 font-medium">
              Số Học Viên Nợ
            </p>
            <p className="text-3xl font-bold text-orange-900 mt-2">
              {debtors.length}
            </p>
          </div>
        </Card>
        <Card className="bg-yellow-50">
          <div className="text-center">
            <p className="text-sm text-yellow-600 font-medium">
              Nợ Quá Hạn (>30 ngày)
            </p>
            <p className="text-3xl font-bold text-yellow-900 mt-2">
              {criticalDebtors}
            </p>
          </div>
        </Card>
      </div>

      {/* Debtors Table */}
      <Card>
        <Table columns={columns} data={debtors} />
      </Card>
    </div>
  );
};

export default DebtTrackingPage;
