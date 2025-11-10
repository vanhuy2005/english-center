import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { Card, Loading, Table, Badge } from "@components/common";
import { CheckCircle, AlertCircle, Calendar, Download } from "lucide-react";
import { LineChart } from "@components/charts";

const AttendanceTrackingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    stats: {
      totalSessions: 0,
      averageRate: 0,
      lowAttendanceCount: 0,
    },
    lowAttendanceStudents: [],
    attendanceTrend: { labels: [], datasets: [] },
  });
  const [filters, setFilters] = useState({
    classId: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadClasses();
    loadAttendanceData();
  }, [filters]);

  const loadClasses = async () => {
    try {
      const response = await api.get("/api/staff/academic/classes");
      if (response.data.success) {
        setClasses(response.data.data.classes);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/academic/attendance", {
        params: filters,
      });

      if (response.data.success) {
        setAttendanceData(response.data.data);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.post(
        "/api/staff/academic/attendance/report",
        filters,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting report:", error);
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
        </div>
      ),
    },
    {
      header: "Lớp",
      accessor: "class",
      cell: (row) => <span className="text-gray-900">{row.class?.name}</span>,
    },
    {
      header: "Tổng Buổi",
      accessor: "totalSessions",
      cell: (row) => (
        <div className="text-center font-medium">{row.totalSessions}</div>
      ),
    },
    {
      header: "Đi Học",
      accessor: "presentCount",
      cell: (row) => (
        <div className="text-center text-green-600 font-medium">
          {row.presentCount}
        </div>
      ),
    },
    {
      header: "Vắng",
      accessor: "absentCount",
      cell: (row) => (
        <div className="text-center text-red-600 font-medium">
          {row.absentCount}
        </div>
      ),
    },
    {
      header: "Có Phép",
      accessor: "excusedCount",
      cell: (row) => (
        <div className="text-center text-yellow-600 font-medium">
          {row.excusedCount}
        </div>
      ),
    },
    {
      header: "Tỉ Lệ",
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
      header: "Cảnh Báo",
      accessor: "warning",
      cell: (row) =>
        row.attendanceRate < 80 ? (
          <Badge variant="danger">
            <AlertCircle size={14} className="inline mr-1" />
            Cần theo dõi
          </Badge>
        ) : (
          <Badge variant="success">
            <CheckCircle size={14} className="inline mr-1" />
            Tốt
          </Badge>
        ),
    },
    {
      header: "Thao Tác",
      accessor: "actions",
      cell: (row) => (
        <button
          onClick={() => navigate(`/academic/students/${row.student._id}`)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  const { stats, lowAttendanceStudents, attendanceTrend } = attendanceData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Theo Dõi Chuyên Cần
            </h1>
            <p className="text-gray-600 mt-1">
              Giám sát chuyên cần toàn trung tâm
            </p>
          </div>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={18} />
          Xuất Báo Cáo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50">
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Tổng Buổi Học</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {stats.totalSessions}
            </p>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">
              Tỉ Lệ Chuyên Cần TB
            </p>
            <p className="text-3xl font-bold text-green-900 mt-2">
              {stats.averageRate}%
            </p>
          </div>
        </Card>
        <Card className="bg-red-50">
          <div className="text-center">
            <p className="text-sm text-red-600 font-medium">
              Học Viên Cần Theo Dõi
            </p>
            <p className="text-3xl font-bold text-red-900 mt-2">
              {stats.lowAttendanceCount}
            </p>
            <p className="text-xs text-red-600 mt-1">(Dưới 80%)</p>
          </div>
        </Card>
      </div>

      {/* Attendance Trend Chart */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">
            Xu Hướng Chuyên Cần
          </h3>
        </div>
        <LineChart data={attendanceTrend} height={300} />
      </Card>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

      {/* Low Attendance Students Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Học Viên Chuyên Cần Kém (Dưới 80%)
        </h3>
        <Table columns={columns} data={lowAttendanceStudents} />
      </Card>
    </div>
  );
};

export default AttendanceTrackingPage;
