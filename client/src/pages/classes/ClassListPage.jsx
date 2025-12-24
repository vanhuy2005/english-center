import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Loading, Table, Badge, Input } from "@components/common";
import { classService, courseService } from "@services";
import toast from "react-hot-toast";
import { useAuth, useLanguage } from "@hooks";


const ClassListPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    courseId: "",
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAll({ page: 1, pageSize: 100 });
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classService.getAll(filters);
      setClasses(res.data || []);
      setPagination(res.pagination || {});
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      upcoming: { label: "Sắp khai giảng", variant: "info" },
      ongoing: { label: "Đang học", variant: "success" },
      completed: { label: "Đã kết thúc", variant: "secondary" },
      cancelled: { label: "Đã hủy", variant: "danger" },
    };
    const config = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      header: "Mã lớp",
      accessor: (row) => (
        <button
          onClick={() => navigate(`/classes/${row._id}`)}
          className="text-primary hover:underline font-medium"
        >
          {row.classCode}
        </button>
      ),
    },
    {
      header: "Tên lớp",
      accessor: "className",
    },
    {
      header: "Khóa học",
      accessor: (row) => row.course?.name || "N/A",
    },
    {
      header: "Giáo viên",
      accessor: (row) =>
        row.teacher?.fullName ||
        row.teacher?.user?.fullName ||
        "Chưa phân công",
    },
    {
      header: "Học viên",
      accessor: (row) => `${row.students?.length || 0}/${row.maxStudents}`,
    },
    {
      header: "Trạng thái",
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: "Thao tác",
      accessor: (row) => (
        <div className="flex gap-2">
          {role === "director" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/classes/${row._id}/edit`)}
            >
              Sửa
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading && classes.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h1>
          <p className="text-gray-600">
            Tổng số: {pagination.total || 0} lớp học
          </p>
        </div>
        {role === "director" && (
          <Button onClick={() => navigate("/classes/new")}>
            + Tạo lớp mới
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Tìm kiếm theo tên, mã lớp..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <select
            value={filters.courseId}
            onChange={(e) => handleFilterChange("courseId", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả khóa học</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="upcoming">Sắp khai giảng</option>
            <option value="ongoing">Đang học</option>
            <option value="completed">Đã kết thúc</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                search: "",
                status: "",
                courseId: "",
                page: 1,
                pageSize: 10,
              })
            }
          >
            Đặt lại
          </Button>
        </div>
      </Card>

      {/* Classes Table */}
      <Card>
        <Table columns={columns} data={classes} />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              ← Trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Sau →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClassListPage;
