import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { Card, Loading, Table, Badge } from "@components/common";
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";

const ClassManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    level: "all",
  });

  useEffect(() => {
    loadClasses();
  }, [filters]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/academic/classes", {
        params: filters,
      });

      if (response.data.success) {
        setClasses(response.data.data.classes);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Tên Lớp",
      accessor: "name",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.course?.name}</div>
        </div>
      ),
    },
    {
      header: "Giảng Viên",
      accessor: "teacher",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          <span>{row.teacher?.fullName || "Chưa phân công"}</span>
        </div>
      ),
    },
    {
      header: "Học Viên",
      accessor: "studentsCount",
      cell: (row) => (
        <div className="text-center">
          <span className="font-medium">{row.studentsCount}</span>
          <span className="text-gray-500">/{row.maxStudents}</span>
        </div>
      ),
    },
    {
      header: "Chuyên Cần",
      accessor: "attendanceRate",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div
              className={`h-2 rounded-full ${
                row.attendanceRate >= 80
                  ? "bg-green-500"
                  : row.attendanceRate >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${row.attendanceRate}%` }}
            />
          </div>
          <span className="text-sm font-medium">{row.attendanceRate}%</span>
        </div>
      ),
    },
    {
      header: "Điểm TB",
      accessor: "averageGrade",
      cell: (row) => (
        <span
          className={`font-medium ${
            row.averageGrade >= 8
              ? "text-green-600"
              : row.averageGrade >= 6
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          {row.averageGrade?.toFixed(1) || "N/A"}
        </span>
      ),
    },
    {
      header: "Lịch Học",
      accessor: "schedule",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          <div>{row.schedule?.days?.join(", ")}</div>
          <div>{row.schedule?.time}</div>
        </div>
      ),
    },
    {
      header: "Trạng Thái",
      accessor: "status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "active"
              ? "success"
              : row.status === "completed"
              ? "secondary"
              : "warning"
          }
        >
          {row.status === "active" && "Đang học"}
          {row.status === "completed" && "Đã kết thúc"}
          {row.status === "pending" && "Chờ khai giảng"}
        </Badge>
      ),
    },
    {
      header: "Thao Tác",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/academic/classes/${row._id}`)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Chi tiết
          </button>
          <button
            onClick={() => navigate(`/academic/classes/${row._id}/report`)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Báo cáo
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản Lý Lớp Học
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý và giám sát tất cả lớp học
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Tổng Lớp</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {classes.length}
            </p>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">Đang Học</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {classes.filter((c) => c.status === "active").length}
            </p>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="text-center">
            <p className="text-sm text-purple-600 font-medium">Tổng Học Viên</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {classes.reduce((sum, c) => sum + c.studentsCount, 0)}
            </p>
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="text-center">
            <p className="text-sm text-orange-600 font-medium">Chuyên Cần TB</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {(
                classes.reduce((sum, c) => sum + c.attendanceRate, 0) /
                  classes.length || 0
              ).toFixed(0)}
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
              placeholder="Tên lớp, giảng viên..."
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
              <option value="active">Đang học</option>
              <option value="completed">Đã kết thúc</option>
              <option value="pending">Chờ khai giảng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Trình độ
            </label>
            <select
              value={filters.level}
              onChange={(e) =>
                setFilters({ ...filters, level: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="beginner">Sơ cấp</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Cao cấp</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Classes Table */}
      <Card>
        <Table columns={columns} data={classes} />
      </Card>
    </div>
  );
};

export default ClassManagementPage;
