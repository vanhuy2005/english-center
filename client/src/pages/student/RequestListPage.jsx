import React, { useState, useEffect } from "react";
import { studentService } from "../../services";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";
import { useNavigate } from "react-router-dom";

const RequestListPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getMyRequests();
      setRequests(response.data.data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "warning", label: "Chờ xử lý", icon: "⏳" },
      approved: { color: "success", label: "Đã duyệt", icon: "✓" },
      rejected: { color: "danger", label: "Từ chối", icon: "✗" },
      processing: { color: "info", label: "Đang xử lý", icon: "🔄" },
    };
    const config = statusMap[status] || {
      color: "default",
      label: status,
      icon: "?",
    };
    return (
      <Badge color={config.color}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      leave: { label: "Xin nghỉ học", color: "info" },
      makeup: { label: "Xin học bù", color: "success" },
      transfer: { label: "Chuyển lớp", color: "warning" },
      pause: { label: "Tạm dừng", color: "danger" },
      other: { label: "Khác", color: "default" },
    };
    const config = typeMap[type] || { label: type, color: "default" };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Yêu cầu của tôi
          </h1>
          <p className="text-gray-600">Quản lý các yêu cầu bạn đã gửi</p>
        </div>
        <button
          onClick={() => navigate("/requests/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Gửi yêu cầu mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-500 mt-1">Tổng yêu cầu</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-500 mt-1">Chờ xử lý</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-500 mt-1">Đã duyệt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-sm text-gray-500 mt-1">Từ chối</div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Lọc theo trạng thái:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Chờ xử lý
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Từ chối
            </button>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600">
              {filter === "all"
                ? "Bạn chưa gửi yêu cầu nào"
                : "Không có yêu cầu nào"}
            </p>
            <button
              onClick={() => navigate("/requests/new")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Gửi yêu cầu đầu tiên
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request._id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeBadge(request.type)}
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {request.title}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Khóa học:</span>
                      <span>{request.courseName}</span>
                    </div>
                    {request.requestDate && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Ngày yêu cầu:</span>
                        <span>
                          {new Date(request.requestDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-700 mb-3">
                    <span className="font-medium">Lý do: </span>
                    {request.reason}
                  </div>

                  {request.response && (
                    <div
                      className={`mt-3 p-3 rounded-lg ${
                        request.status === "approved"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        Phản hồi từ {request.processorName}:
                      </div>
                      <div className="text-sm">{request.response}</div>
                      {request.processedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(request.processedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestListPage;
