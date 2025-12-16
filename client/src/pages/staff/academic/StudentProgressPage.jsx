import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Table,
  Modal,
} from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const StudentProgressPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
      render: (value, row) => (
        <span
          className={
            value >= 80
              ? "text-green-600"
              : value >= 60
              ? "text-yellow-600"
              : "text-red-600"
          }
        >
          {value}%
        </span>
      ),
    },
    {
      key: "average",
      label: "Điểm TB",
      render: (value, row) => (
        <span
          className={
            value >= 8
              ? "text-green-600 font-semibold"
              : value >= 5
              ? "text-yellow-600"
              : "text-red-600"
          }
        >
          {value?.toFixed(1) || "0.0"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value, row) => {
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
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedStudent(row);
            setShowDetailModal(true);
          }}
        >
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết học viên"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã HV</p>
                  <p className="font-medium">{selectedStudent.studentCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-medium">{selectedStudent.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">
                    {selectedStudent.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Điện thoại</p>
                  <p className="font-medium">
                    {selectedStudent.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">
                Kết quả học tập
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedStudent.average?.toFixed(1) || "0.0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tỷ lệ điểm danh</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedStudent.attendanceRate || 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Status Assessment */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">
                Đánh giá tổng thể
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <Badge
                    variant={
                      selectedStudent.average >= 8 &&
                      selectedStudent.attendanceRate >= 80
                        ? "success"
                        : selectedStudent.average < 5 ||
                          selectedStudent.attendanceRate < 60
                        ? "danger"
                        : "warning"
                    }
                  >
                    {selectedStudent.average >= 8 &&
                    selectedStudent.attendanceRate >= 80
                      ? "Tốt"
                      : selectedStudent.average < 5 ||
                        selectedStudent.attendanceRate < 60
                      ? "Cần cải thiện"
                      : "Trung bình"}
                  </Badge>
                </div>
                {(selectedStudent.average < 5 ||
                  selectedStudent.attendanceRate < 60) && (
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-700">
                      ⚠️ Học viên cần được theo dõi kỹ hơn và có kế hoạch hỗ trợ
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentProgressPage;
