import { useState, useEffect } from "react";
import api from "@services/api";
import { Card, Loading, Table, Badge, Button } from "@components/common";
import { FileCheck, Search, Filter } from "lucide-react";

const GradeManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    classId: "",
    status: "",
  });

  useEffect(() => {
    loadGrades();
  }, [filters]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/academic/grades", {
        params: filters,
      });
      if (response.data.success) {
        setGrades(response.data.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGrade = async (gradeId, data) => {
    try {
      const response = await api.put(
        `/api/staff/academic/grades/${gradeId}`,
        data
      );
      if (response.data.success) {
        alert("Cập nhật điểm thành công!");
        loadGrades();
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
      key: "class",
      label: "Lớp học",
      render: (row) => row.classId?.name || "N/A",
    },
    {
      key: "score",
      label: "Điểm số",
      render: (row) => (
        <span className="text-lg font-bold text-blue-600">
          {row.score || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Kết quả",
      render: (row) => {
        const statusConfig = {
          passed: { variant: "success", label: "Đạt" },
          failed: { variant: "danger", label: "Không đạt" },
          pending: { variant: "warning", label: "Chờ duyệt" },
        };
        const config = statusConfig[row.status] || statusConfig.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "updatedBy",
      label: "Cập nhật bởi",
      render: (row) => row.updatedBy?.fullName || "N/A",
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
                onClick={() => handleUpdateGrade(row._id, { status: "passed" })}
              >
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleUpdateGrade(row._id, { status: "failed" })}
              >
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
        <FileCheck className="text-green-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Điểm</h1>
          <p className="text-gray-600 mt-1">Xem và duyệt điểm học viên</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm học viên..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="passed">Đạt</option>
            <option value="failed">Không đạt</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table data={grades} columns={columns} />
      </Card>
    </div>
  );
};

export default GradeManagementPage;
