import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Loading, Badge, Table } from "@components/common";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  CheckSquare,
  FileText,
} from "lucide-react";
import api from "@services/api";
import { toast } from "react-hot-toast";

/**
 * Class Students Page - View students in a specific class
 */
const ClassStudentsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse] = await Promise.all([
        api.get(`/api/teachers/classes/${classId}`),
        api.get(`/api/teachers/classes/${classId}/students`),
      ]);

      setClassInfo(classResponse.data?.data?.class);
      setStudents(studentsResponse.data?.data?.students || []);
      setStats(studentsResponse.data?.data?.stats);
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast.error("Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { variant: "success", label: "Đang học" },
      completed: { variant: "info", label: "Đã hoàn thành" },
      dropped: { variant: "danger", label: "Đã nghỉ" },
    };
    return badges[status] || badges.active;
  };

  const columns = [
    {
      header: "Mã HV",
      accessor: "studentId",
      render: (value, row) => (
        <span className="font-medium text-blue-600">
          {row.student?.studentId || "N/A"}
        </span>
      ),
    },
    {
      header: "Họ và Tên",
      accessor: "student.fullName",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-blue-600 font-medium">
              {row.student?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.student?.fullName}</p>
            <p className="text-sm text-gray-500">{row.student?.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Số điện thoại",
      accessor: "student.phoneNumber",
      render: (value) => (
        <span className="text-gray-600">{value || "N/A"}</span>
      ),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (value) => <Badge {...getStatusBadge(value)} />,
    },
    {
      header: "Điểm TB",
      accessor: "averageGrade",
      render: (value) => (
        <span
          className={`font-medium ${
            value >= 8
              ? "text-green-600"
              : value >= 5
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          {value ? value.toFixed(1) : "N/A"}
        </span>
      ),
    },
    {
      header: "Tỷ lệ đi học",
      accessor: "attendanceRate",
      render: (value) => (
        <span
          className={`font-medium ${
            value >= 80
              ? "text-green-600"
              : value >= 60
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          {value ? `${value.toFixed(0)}%` : "N/A"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      accessor: "_id",
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              navigate(
                `/teacher/classes/${classId}/students/${row.student._id}`
              )
            }
          >
            Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="small" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Danh Sách Học Viên
          </h1>
          <p className="text-gray-600 mt-1">{classInfo?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => navigate(`/teacher/classes/${classId}/attendance`)}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Điểm danh
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/teacher/classes/${classId}/grades`)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Nhập điểm
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng học viên</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang học</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Điểm TB</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.averageGrade?.toFixed(1) || "N/A"}
                </p>
              </div>
              <FileText className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ đi học</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.attendanceRate?.toFixed(0) || 0}%
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Students Table */}
      <Card>
        <Table
          columns={columns}
          data={students}
          emptyMessage="Chưa có học viên nào trong lớp"
        />
      </Card>
    </div>
  );
};

export default ClassStudentsPage;
