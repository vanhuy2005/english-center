import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Loading, Table, Badge, Modal } from "@components/common";
import { classService, studentService } from "@services";
import toast from "react-hot-toast";
import { useAuth, useLanguage } from "@hooks";

/**
 * ClassDetailPage - View class details with students, schedule, and actions
 */
const ClassDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    fetchClassData();
  }, [id]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const classRes = await classService.getById(id);
      setClassData(classRes.data);
      // Lấy students từ classData.students (đã populate từ API)
      const studentsList = (classRes.data?.students || [])
        .map((item) => item.student)
        .filter(Boolean);
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast.error("Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa học viên khỏi lớp này?")) {
      return;
    }

    try {
      await classService.removeStudent(id, studentId);
      toast.success("Đã xóa học viên khỏi lớp");
      fetchClassData();
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Không thể xóa học viên");
    }
  };

  const handleOpenAddStudentModal = async () => {
    try {
      const res = await studentService.getAll({ pageSize: 1000 });
      console.log("API Response:", res);
      console.log("res.data:", res.data);
      console.log("res.data type:", typeof res.data);
      console.log("res.data?.data:", res.data?.data);

      // Xử lý response - có thể là res.data hoặc res.data.data tùy vào API structure
      const allStudents = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const existingIds = students.map((s) => s._id);
      const filtered = allStudents.filter((s) => !existingIds.includes(s._id));

      console.log("Total students:", allStudents.length);
      console.log("Existing in class:", existingIds.length);
      console.log("Available to add:", filtered.length);

      setAvailableStudents(filtered);
      if (filtered.length === 0) {
        if (allStudents.length === 0) {
          toast.error("Không có học viên nào trong hệ thống");
        } else {
          toast.error("Tất cả học viên đã thuộc lớp này");
        }
        return;
      }
      setShowAddStudentModal(true);
    } catch (error) {
      console.error("Error loading available students:", error);
      toast.error("Không thể tải danh sách học viên");
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) {
      toast.error("Vui lòng chọn học viên");
      return;
    }

    setAddingStudent(true);
    try {
      await classService.addStudent(id, selectedStudent);
      toast.success("Đã thêm học viên vào lớp!");
      setSelectedStudent("");
      setShowAddStudentModal(false);
      // Đồng bộ dữ liệu sau khi thêm
      await fetchClassData();
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error(error?.response?.data?.message || "Không thể thêm học viên");
    } finally {
      setAddingStudent(false);
    }
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

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!classData) {
    return (
      <div className="p-6">
        <Card>
          <p className="text-center text-gray-600">Không tìm thấy lớp học</p>
        </Card>
      </div>
    );
  }

  const studentColumns = [
    {
      header: "STT",
      accessor: (_, index) => index + 1,
      className: "w-16 text-center",
    },
    {
      header: "Mã HV",
      accessor: (row) => row.studentCode || "N/A",
    },
    {
      header: "Họ và tên",
      accessor: (row) => (
        <button
          onClick={() => navigate(`/students/${row._id}`)}
          className="text-primary hover:underline"
        >
          {row.fullName || row.user?.fullName || "N/A"}
        </button>
      ),
    },
    {
      header: "Số điện thoại",
      accessor: (row) => row.phone || row.user?.phone || "N/A",
    },
    {
      header: "Trạng thái",
      accessor: (row) => (
        <Badge
          variant={
            row.academicStatus === "active"
              ? "success"
              : row.academicStatus === "paused"
              ? "warning"
              : "secondary"
          }
        >
          {row.academicStatus === "active"
            ? "Đang học"
            : row.academicStatus === "paused"
            ? "Tạm dừng"
            : "Đã hoàn thành"}
        </Badge>
      ),
    },
    {
      header: "Thao tác",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/students/${row._id}`)}
          >
            Chi tiết
          </Button>
          {(role === "director" || role === "academic") && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleRemoveStudent(row._id)}
            >
              Xóa
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {classData.className}
          </h1>
          <p className="text-gray-600">{classData.classCode}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/classes")}>
            ← Quay lại
          </Button>
          {role === "director" && (
            <Button onClick={() => navigate(`/classes/${id}/edit`)}>
              ✏️ Sửa
            </Button>
          )}
        </div>
      </div>

      {/* Class Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Khóa học:</span>
              <p className="font-medium">
                {classData.course?.name || "Chưa có"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Giáo viên:</span>
              <p className="font-medium">
                {classData.teacher?.fullName ||
                  classData.teacher?.user?.fullName ||
                  "Chưa có"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <div className="mt-1">{getStatusBadge(classData.status)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Lịch học</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Ngày khai giảng:</span>
              <p className="font-medium">
                {classData.startDate && !isNaN(new Date(classData.startDate))
                  ? new Date(classData.startDate).toLocaleDateString("vi-VN")
                  : "Chưa có"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Ngày kết thúc:</span>
              <p className="font-medium">
                {classData.endDate && !isNaN(new Date(classData.endDate))
                  ? new Date(classData.endDate).toLocaleDateString("vi-VN")
                  : "Chưa có"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Lịch học:</span>
              <p className="font-medium">
                {Array.isArray(classData.schedule) &&
                classData.schedule.length > 0
                  ? classData.schedule.map((s) => s.dayOfWeek).join(", ")
                  : "Chưa có"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Số học viên:</span>
              <p className="text-2xl font-bold text-primary">
                {students.length}/{classData.maxStudents || 0}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Tỷ lệ lấp đầy:</span>
              <p className="text-lg font-semibold">
                {classData.maxStudents && classData.maxStudents > 0
                  ? Math.round((students.length / classData.maxStudents) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions for Teacher */}
      {role === "teacher" && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Thao tác nhanh</h3>
          <div className="flex gap-4">
            <Button onClick={() => navigate(`/attendance/mark/${id}`)}>
              ✅ Điểm danh
            </Button>
            <Button onClick={() => navigate(`/grades/input/${id}`)}>
              📝 Nhập điểm
            </Button>
            <Button variant="outline" onClick={() => navigate(`/schedule`)}>
              📅 Xem lịch giảng
            </Button>
          </div>
        </Card>
      )}

      {/* Students List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Danh sách học viên</h3>
          {(role === "director" || role === "enrollment") && (
            <Button
              size="sm"
              onClick={handleOpenAddStudentModal}
              disabled={
                classData?.maxStudents > 0 &&
                students.length >= classData.maxStudents
              }
            >
              + Thêm học viên
            </Button>
          )}
        </div>
        <Table columns={studentColumns} data={students} />
        <Modal
          open={showAddStudentModal}
          onClose={() => {
            setShowAddStudentModal(false);
            setSelectedStudent("");
          }}
        >
          <div className="p-6 min-w-[400px]">
            <h2 className="text-xl font-bold mb-4">Thêm học viên vào lớp</h2>
            {availableStudents.length === 0 ? (
              <p className="text-gray-600 mb-4">
                Tất cả học viên đã thuộc lớp này hoặc không có học viên khả
                dụng.
              </p>
            ) : (
              <>
                <label className="block text-sm font-medium mb-2">
                  Chọn học viên:
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={addingStudent}
                >
                  <option value="">-- Chọn học viên --</option>
                  {availableStudents.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.fullName || student.user?.fullName} (
                      {student.studentCode})
                    </option>
                  ))}
                </select>
              </>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSelectedStudent("");
                }}
                disabled={addingStudent}
              >
                Đóng
              </Button>
              <Button
                onClick={handleAddStudent}
                disabled={
                  addingStudent ||
                  !selectedStudent ||
                  availableStudents.length === 0
                }
                loading={addingStudent}
              >
                {addingStudent ? "Đang thêm..." : "Thêm học viên"}
              </Button>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default ClassDetailPage;
