import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, Button, Badge, Loading, Input, Table } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const StudentProgressPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    good: 0,
    warning: 0,
    danger: 0,
    total: 0,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/staff/academic/students");
      const data = response.data?.data || response.data || [];
      const students = Array.isArray(data) ? data : [];
      setStudents(students);

      const good = students.filter(
        (s) => s.average >= 8 && s.attendanceRate >= 80
      ).length;
      const warning = students.filter(
        (s) =>
          (s.average >= 5 && s.average < 8) ||
          (s.attendanceRate >= 60 && s.attendanceRate < 80)
      ).length;
      const danger = students.filter(
        (s) => s.average < 5 || s.attendanceRate < 60
      ).length;

      setStats({ good, warning, danger, total: students.length });
    } catch (error) {
      toast.error("Không thể tải dữ liệu học viên");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "studentCode", label: "Mã HV" },
    { key: "fullName", label: "Họ và tên" },
    {
      key: "attendanceRate",
      label: "Điểm danh",
      render: (row) => (
        <span
          className={
            row.attendanceRate >= 80
              ? "text-green-600"
              : row.attendanceRate >= 60
              ? "text-yellow-600"
              : "text-red-600"
          }
        >
          {row.attendanceRate}%
        </span>
      ),
    },
    {
      key: "average",
      label: "Điểm TB",
      render: (row) => (
        <span
          className={
            row.average >= 8
              ? "text-green-600 font-semibold"
              : row.average >= 5
              ? "text-yellow-600"
              : "text-red-600"
          }
        >
          {row.average?.toFixed(1) || "0.0"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => {
        const isGood = row.average >= 8 && row.attendanceRate >= 80;
        const isDanger = row.average < 5 || row.attendanceRate < 60;
        return (
          <Badge variant={isGood ? "success" : isDanger ? "danger" : "warning"}>
            {isGood ? "Tốt" : isDanger ? "Cần cải thiện" : "Trung bình"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      render: () => (
        <Button size="sm" variant="outline">
          Chi tiết
        </Button>
      ),
    },
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">
          Theo dõi tiến độ học viên
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Học tốt</p>
              <p className="text-3xl font-bold mt-1">{stats.good}</p>
            </div>
            <CheckCircle className="w-12 h-12 opacity-80" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Cần chú ý</p>
              <p className="text-3xl font-bold mt-1">{stats.warning}</p>
            </div>
            <AlertTriangle className="w-12 h-12 opacity-80" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Cần cải thiện</p>
              <p className="text-3xl font-bold mt-1">{stats.danger}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-[#132440] to-[#16476A] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tổng học viên</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Table columns={columns} data={filteredStudents} />
      </Card>
    </div>
  );
};

export default StudentProgressPage;
