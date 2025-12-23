import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Loading,
  Badge,
  Modal,
  Input,
  Table,
} from "../../../components/common";
import {
  ClipboardList,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

const RequestManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "pending",
    type: "",
  });
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processAction, setProcessAction] = useState("");
  const [processNote, setProcessNote] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/enrollment/requests", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        },
      });

      console.log("Full API Response:", response.data);
      const responseData = response.data?.data || response.data;
      console.log("Response Data:", responseData);

      // Handle the response correctly
      const requestsList = Array.isArray(responseData)
        ? responseData
        : responseData?.requests || responseData || [];

      console.log("Requests list:", requestsList);
      setRequests(requestsList);

      if (response.data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
        }));
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Không thể tải danh sách yêu cầu");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessClick = (request, action) => {
    setSelectedRequest(request);
    setProcessAction(action);
    setSelectedClassId("");
    setShowProcessModal(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !processAction) return;

    try {
      setLoading(true);
      const body = { action: processAction, note: processNote };
      if (
        processAction === "approve" &&
        selectedRequest?.type === "course_enrollment" &&
        selectedClassId
      ) {
        body.classId = selectedClassId;
      }

      const response = await api.put(
        `/staff/enrollment/requests/${selectedRequest._id}`,
        body
      );

      if (response.data.success) {
        toast.success(
          processAction === "approve"
            ? "Đã phê duyệt yêu cầu thành công!"
            : "Đã từ chối yêu cầu!"
        );
        setShowProcessModal(false);
        setSelectedRequest(null);
        setProcessAction("");
        setProcessNote("");
        setAvailableClasses([]);
        setSelectedClassId("");
        fetchRequests();
      }
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error(error.response?.data?.message || "Không thể xử lý yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes for assignment when processing enrollment requests
  useEffect(() => {
    const fetchClassesIfNeeded = async () => {
      if (
        showProcessModal &&
        selectedRequest &&
        selectedRequest.type === "course_enrollment"
      ) {
        try {
          const res = await api.get("/staff/enrollment/classes", {
            params: {
              // Use 'ongoing' (server uses 'ongoing' not 'active')
              status: "upcoming,ongoing",
              course: selectedRequest.course?._id,
            },
          });
          const classList =
            res.data?.data?.classes || res.data?.data || res.data || [];
          setAvailableClasses(Array.isArray(classList) ? classList : []);
        } catch (err) {
          console.error("Error fetching classes for request processing:", err);
          setAvailableClasses([]);
        }
      }
    };
    fetchClassesIfNeeded();
  }, [showProcessModal, selectedRequest]);

  const getTypeLabel = (type) => {
    const labels = {
      transfer: "Đổi lớp",
      pause: "Bảo lưu",
      resume: "Học lại",
      leave: "Xin nghỉ",
    };
    return labels[type] || type;
  };

  const getTypeVariant = (type) => {
    const variants = {
      transfer: "info",
      pause: "warning",
      resume: "success",
      leave: "secondary",
    };
    return variants[type] || "secondary";
  };

  const getStatusVariant = (status) => {
    const variants = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
    };
    return variants[status] || "secondary";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ xử lý",
      approved: "Đã duyệt",
      rejected: "Từ chối",
    };
    return labels[status] || status;
  };

  const columns = [
    {
      key: "student",
      label: "Học viên",
      render: (fieldValue, request) => {
        if (!request?.student) return "N/A";
        const studentName =
          request.student?.fullName ||
          request.student?.user?.fullName ||
          "Không rõ";
        const studentCode = request.student?.studentCode || "N/A";

        return (
          <div>
            <p className="font-medium">{studentName}</p>
            <p className="text-sm text-gray-600">{studentCode}</p>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Loại yêu cầu",
      render: (fieldValue, request) => (
        <Badge variant={getTypeVariant(request?.type)}>
          {getTypeLabel(request?.type)}
        </Badge>
      ),
    },
    {
      key: "class",
      label: "Lớp học",
      render: (fieldValue, request) => {
        if (!request) return "N/A";
        const className = request.class?.name || "N/A";
        const targetClassName = request.targetClass?.name;

        return (
          <div>
            <p className="text-sm">{className}</p>
            {request.type === "transfer" && targetClassName && (
              <p className="text-xs text-gray-600">→ {targetClassName}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "reason",
      label: "Lý do",
      render: (fieldValue, request) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
          {request.reason || "Không có"}
        </p>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (fieldValue, request) => (
        <Badge variant={getStatusVariant(request.status)}>
          {getStatusLabel(request.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (fieldValue, request) => {
        if (!request?.createdAt) return "N/A";
        const date = new Date(request.createdAt);
        return isNaN(date.getTime())
          ? "Invalid Date"
          : date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (fieldValue, request) => {
        if (!request) return "N/A";
        return request.status === "pending" ? (
          <div className="flex gap-2">
            <Button
              size="small"
              variant="success"
              onClick={() => handleProcessClick(request, "approve")}
            >
              <CheckCircle className="w-4 h-4 mr-1 inline" />
              Duyệt
            </Button>
            <Button
              size="small"
              variant="danger"
              onClick={() => handleProcessClick(request, "reject")}
            >
              <XCircle className="w-4 h-4 mr-1 inline" />
              Từ chối
            </Button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">
            {request.processedAt &&
              new Date(request.processedAt).toLocaleDateString("vi-VN")}
          </span>
        );
      },
    },
  ];

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#132440] to-[#16476A] bg-clip-text text-transparent flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#132440]" />
            Xử Lý Yêu Cầu
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý yêu cầu đổi lớp, bảo lưu và học lại
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Trạng thái</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="pending">Chờ xử lý</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="">Tất cả</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Loại yêu cầu
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">Tất cả</option>
              <option value="transfer">Đổi lớp</option>
              <option value="pause">Bảo lưu</option>
              <option value="resume">Học lại</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({ status: "pending", type: "" });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full"
            >
              🔄 Đặt lại bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === "pending").length}
            </p>
            <p className="text-sm text-gray-600">Chờ xử lý</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {requests.filter((r) => r.status === "approved").length}
            </p>
            <p className="text-sm text-gray-600">Đã duyệt</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {requests.filter((r) => r.status === "rejected").length}
            </p>
            <p className="text-sm text-gray-600">Từ chối</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {pagination.total}
            </p>
            <p className="text-sm text-gray-600">Tổng yêu cầu</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyMessage="Không có yêu cầu nào"
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              trong tổng số {pagination.total} yêu cầu
            </p>
            <div className="flex gap-2">
              <Button
                size="small"
                variant="secondary"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                ← Trước
              </Button>
              <span className="px-4 py-2 border rounded-lg">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                size="small"
                variant="secondary"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Sau →
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Process Modal */}
      {showProcessModal && selectedRequest && (
        <Modal
          isOpen={showProcessModal}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedRequest(null);
            setProcessAction("");
            setProcessNote("");
          }}
          title={`${
            processAction === "approve" ? "Phê duyệt" : "Từ chối"
          } yêu cầu`}
          size="medium"
        >
          <div className="space-y-4">
            {/* Request Info */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Học viên:</span>{" "}
                {selectedRequest.student?.fullName ||
                  selectedRequest.student?.user?.fullName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Loại yêu cầu:</span>{" "}
                {getTypeLabel(selectedRequest.type)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Lớp học:</span>{" "}
                {selectedRequest.class?.name}
              </p>
              {selectedRequest.type === "transfer" &&
                selectedRequest.targetClass && (
                  <p className="text-sm">
                    <span className="font-medium">Chuyển đến:</span>{" "}
                    {selectedRequest.targetClass.name}
                  </p>
                )}
              <p className="text-sm">
                <span className="font-medium">Lý do:</span>{" "}
                {selectedRequest.reason || "Không có"}
              </p>
            </div>

            {/* Class selector for course enrollment requests */}
            {processAction === "approve" &&
              selectedRequest.type === "course_enrollment" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gán lớp cho học viên (tùy chọn)
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {availableClasses.map((c) => {
                      const cap = c.capacity?.max ?? c.capacity ?? 0;
                      const enrolled =
                        c.currentEnrollment ?? c.students?.length ?? 0;
                      return (
                        <option key={c._id} value={c._id}>
                          {c.name} ({enrolled}/{cap})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="4"
                value={processNote}
                onChange={(e) => setProcessNote(e.target.value)}
                placeholder="Nhập ghi chú về quyết định của bạn..."
              />
            </div>

            {/* Warning */}
            {processAction === "approve" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Sau khi phê duyệt, hệ thống sẽ tự động cập nhật trạng thái
                    học viên và lớp học tương ứng.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowProcessModal(false);
                  setSelectedRequest(null);
                  setProcessAction("");
                  setProcessNote("");
                }}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                variant={processAction === "approve" ? "success" : "danger"}
                onClick={handleProcessRequest}
                loading={loading}
              >
                {processAction === "approve" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Phê duyệt
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2 inline" />
                    Từ chối
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RequestManagementPage;
