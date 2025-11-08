import { useState, useEffect } from "react";
import api from "@services/api";
import { Card, Loading, Table, Badge, Button } from "@components/common";
import { ClipboardList, CheckCircle, XCircle } from "lucide-react";

const RequestHandlingPage = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/academic/requests");
      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm("Xác nhận duyệt yêu cầu này?")) return;
    try {
      const response = await api.put(
        `/api/staff/academic/requests/${requestId}/approve`
      );
      if (response.data.success) {
        alert("Đã duyệt yêu cầu!");
        loadRequests();
      }
    } catch (error) {
      alert("Có lỗi xảy ra!");
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;
    try {
      const response = await api.put(
        `/api/staff/academic/requests/${requestId}/reject`,
        {
          rejectionReason: reason,
        }
      );
      if (response.data.success) {
        alert("Đã từ chối yêu cầu!");
        loadRequests();
      }
    } catch (error) {
      alert("Có lỗi xảy ra!");
    }
  };

  const columns = [
    {
      key: "student",
      label: "Học viên",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.studentId?.fullName || "N/A"}
          </p>
          <p className="text-sm text-gray-600">{row.studentId?.email}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Loại yêu cầu",
      render: (row) => {
        const typeConfig = {
          transfer: { label: "Chuyển lớp", color: "blue" },
          defer: { label: "Bảo lưu", color: "orange" },
          leave: { label: "Nghỉ học", color: "red" },
        };
        const config = typeConfig[row.type] || {
          label: row.type,
          color: "gray",
        };
        return <Badge variant={config.color}>{config.label}</Badge>;
      },
    },
    {
      key: "reason",
      label: "Lý do",
      render: (row) => (
        <p className="text-gray-700 max-w-xs truncate">{row.reason}</p>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => {
        const statusConfig = {
          pending: { variant: "warning", label: "Chờ duyệt" },
          approved: { variant: "success", label: "Đã duyệt" },
          rejected: { variant: "danger", label: "Từ chối" },
        };
        const config = statusConfig[row.status] || statusConfig.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "createdAt",
      label: "Ngày gửi",
      render: (row) => new Date(row.createdAt).toLocaleDateString("vi-VN"),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(row._id)}
                className="flex items-center gap-1"
              >
                <CheckCircle size={16} />
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleReject(row._id)}
                className="flex items-center gap-1"
              >
                <XCircle size={16} />
                Từ chối
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-purple-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xử Lý Yêu Cầu</h1>
          <p className="text-gray-600 mt-1">
            Duyệt yêu cầu chuyển lớp, bảo lưu của học viên
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-50">
          <div className="text-center">
            <p className="text-sm text-yellow-600 font-medium">Chờ xử lý</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {requests.filter((r) => r.status === "pending").length}
            </p>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">Đã duyệt</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {requests.filter((r) => r.status === "approved").length}
            </p>
          </div>
        </Card>
        <Card className="bg-red-50">
          <div className="text-center">
            <p className="text-sm text-red-600 font-medium">Từ chối</p>
            <p className="text-2xl font-bold text-red-900 mt-1">
              {requests.filter((r) => r.status === "rejected").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table data={requests} columns={columns} />
      </Card>
    </div>
  );
};

export default RequestHandlingPage;
