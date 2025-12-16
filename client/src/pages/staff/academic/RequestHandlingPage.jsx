import React, { useState, useEffect } from "react";
import { ClipboardList, Check, X } from "lucide-react";
import { Card, Button, Badge, Loading, Table, Modal } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const RequestHandlingPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/staff/academic/requests");
      const requestsList =
        response.data?.requests || response.data?.data?.requests || [];
      const requests = Array.isArray(requestsList) ? requestsList : [];
      setRequests(requests);

      const pending = requests.filter((r) => r.status === "pending").length;
      const approved = requests.filter((r) => r.status === "approved").length;
      const rejected = requests.filter((r) => r.status === "rejected").length;

      setStats({ pending, approved, rejected });
    } catch (error) {
      toast.error("Không thể tải danh sách yêu cầu");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      await api.put(`/staff/academic/requests/${selectedRequest._id}`, {
        status: action,
      });
      toast.success(
        `Đã ${action === "approved" ? "phê duyệt" : "từ chối"} yêu cầu`
      );
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      toast.error("Không thể xử lý yêu cầu");
    }
  };

  const columns = [
    {
      key: "studentCode",
      label: "Mã HV",
      render: (value, row) => row.student?.studentCode || "N/A",
    },
    {
      key: "studentName",
      label: "Học viên",
      render: (value, row) => row.student?.fullName || "N/A",
    },
    {
      key: "type",
      label: "Loại",
      render: (value, row) => (
        <Badge variant="info">
          {row.type === "leave"
            ? "Nghỉ học"
            : row.type === "makeup"
            ? "Học bù"
            : "Chuyển lớp"}
        </Badge>
      ),
    },
    { key: "reason", label: "Lý do" },
    {
      key: "status",
      label: "Trạng thái",
      render: (value, row) => (
        <Badge
          variant={
            row.status === "approved"
              ? "success"
              : row.status === "rejected"
              ? "danger"
              : "warning"
          }
        >
          {row.status === "approved"
            ? "Đã duyệt"
            : row.status === "rejected"
            ? "Từ chối"
            : "Chờ duyệt"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (value, row) =>
        row.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAction(row, "approved")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleAction(row, "rejected")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ),
    },
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">Xử lý yêu cầu</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div>
            <p className="text-sm opacity-90">Chờ xử lý</p>
            <p className="text-3xl font-bold mt-1">{stats.pending}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div>
            <p className="text-sm opacity-90">Đã phê duyệt</p>
            <p className="text-3xl font-bold mt-1">{stats.approved}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div>
            <p className="text-sm opacity-90">Đã từ chối</p>
            <p className="text-3xl font-bold mt-1">{stats.rejected}</p>
          </div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={requests} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Xác nhận"
      >
        <div className="space-y-4">
          <p>
            Bạn có chắc chắn muốn{" "}
            {action === "approved" ? "phê duyệt" : "từ chối"} yêu cầu này?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={confirmAction}
              className={action === "approved" ? "bg-green-600" : "bg-red-600"}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequestHandlingPage;
