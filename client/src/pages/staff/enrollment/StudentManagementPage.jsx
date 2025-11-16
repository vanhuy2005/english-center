import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Users,
  UserPlus,
  Search,
  Eye,
  Edit,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

const StudentManagementPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/enrollment/students", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        },
      });

      console.log("API Response:", response);
      console.log("Response data:", response.data);

      const responseData = response.data?.data || response.data;
      const studentsList = responseData?.students || responseData || [];
      
      console.log("Students list:", studentsList);
      
      setStudents(Array.isArray(studentsList) ? studentsList : []);
      
      if (response.data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
        }));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      console.error("Error response:", error.response);
      toast.error("Không thể tải danh sách học viên");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewDetails = (student) => {
    if (!student?._id) return;
    navigate(`/enrollment/students/${student._id}`);
  };

  const handleEnrollClick = (student) => {
    if (!student) return;
    setSelectedStudent(student);
    setShowEnrollModal(true);
  };

  const columns = [
    {
      key: "studentCode",
      label: "Mã học viên",
      render: (student) => (
        <span className="font-mono font-semibold">
          {student.studentCode || "N/A"}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Họ và tên",
      render: (student) => (
        <div>
          <p className="font-medium">{student.fullName}</p>
          <p className="text-sm text-gray-600">{student.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Số điện thoại",
      render: (student) => student.user?.phone || "N/A",
    },
    {
      key: "academicStatus",
      label: "Trạng thái",
      render: (student) => {
        const statusConfig = {
          active: { variant: "success", label: "Đang học" },
          inactive: { variant: "secondary", label: "Chưa ghi danh" },
          paused: { variant: "warning", label: "Bảo lưu" },
          completed: { variant: "info", label: "Hoàn thành" },
          dropped: { variant: "danger", label: "Nghỉ học" },
        };
        const config = statusConfig[student?.academicStatus] || {
          variant: "secondary",
          label: student?.academicStatus || "Chưa xác định",
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "enrolledCourses",
      label: "Khóa học",
      render: (student) => (
        <div className="flex flex-wrap gap-1">
          {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
            student.enrolledCourses.map((course) => (
              <Badge key={course._id} variant="info">
                {course.courseCode || course.name}
              </Badge>
            ))
          ) : (
            <span className="text-gray-500 text-sm">Chưa ghi danh</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (student) =>
        new Date(student.createdAt).toLocaleDateString("vi-VN"),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (student) => (
        <div className="flex gap-2">
          <Button
            size="small"
            variant="primary"
            onClick={() => handleViewDetails(student)}
          >
            <Eye className="w-4 h-4 mr-1 inline" />
            Chi tiết
          </Button>
          {student?.academicStatus !== "active" && (
            <Button
              size="small"
              variant="success"
              onClick={() => handleEnrollClick(student)}
            >
              <BookOpen className="w-4 h-4 mr-1 inline" />
              Ghi danh
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading && students.length === 0) {
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
            <Users className="w-8 h-8 text-[#132440]" />
            Quản Lý Học Viên
          </h1>
          <p className="text-gray-600 mt-1">
            Danh sách tất cả học viên trong hệ thống
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowNewStudentModal(true)}>
          <UserPlus className="w-5 h-5 mr-2 inline" />
          Thêm học viên mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Tìm kiếm theo tên, mã, email..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9797]"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang học</option>
              <option value="inactive">Chưa ghi danh</option>
              <option value="paused">Bảo lưu</option>
              <option value="completed">Hoàn thành</option>
              <option value="dropped">Nghỉ học</option>
            </select>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setFilters({ search: "", status: "" });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            🔄 Đặt lại bộ lọc
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {pagination.total}
            </p>
            <p className="text-sm text-gray-600">Tổng học viên</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {students.filter((s) => s?.academicStatus === "active").length}
            </p>
            <p className="text-sm text-gray-600">Đang học</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {students.filter((s) => s?.academicStatus === "paused").length}
            </p>
            <p className="text-sm text-gray-600">Bảo lưu</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">
              {students.filter((s) => s?.academicStatus === "inactive").length}
            </p>
            <p className="text-sm text-gray-600">Chưa ghi danh</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={students}
          loading={loading}
          emptyMessage="Không có học viên nào"
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              trong tổng số {pagination.total} học viên
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

      {/* New Student Modal */}
      <NewStudentModal
        isOpen={showNewStudentModal}
        onClose={() => setShowNewStudentModal(false)}
        onSuccess={() => {
          setShowNewStudentModal(false);
          fetchStudents();
        }}
      />

      {/* Enroll Modal */}
      <EnrollStudentModal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={() => {
          setShowEnrollModal(false);
          setSelectedStudent(null);
          fetchStudents();
        }}
      />
    </div>
  );
};

// New Student Modal Component
const NewStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("/staff/enrollment/students", formData);

      if (response.data.success) {
        toast.success("Đã thêm học viên mới thành công!");
        toast.info(`Mật khẩu mặc định: ${response.data.data.defaultPassword}`, {
          duration: 5000,
        });
        onSuccess();
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          gender: "male",
          address: "",
        });
      }
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error(
        error.response?.data?.message || "Không thể thêm học viên mới"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="➕ Thêm học viên mới"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            ℹ️ Mật khẩu mặc định sẽ là <strong>123456</strong>. Học viên sẽ được
            yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Họ và tên *"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="Nguyễn Văn A"
          />
          <Input
            label="Số điện thoại *"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="0123456789"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="example@email.com"
          />
          <Input
            label="Ngày sinh"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium mb-2">Giới tính</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Số nhà, đường, quận, thành phố"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Thêm học viên
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Enroll Student Modal Component
const EnrollStudentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableClasses();
    }
  }, [isOpen]);

  const fetchAvailableClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await api.get("/staff/enrollment/classes", {
        params: { status: "upcoming,active" },
      });
      if (response.data.success) {
        setClasses(response.data.data.classes);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/staff/enrollment/students/${student._id}/enroll`,
        { classId: selectedClass }
      );

      if (response.data.success) {
        toast.success("Đã ghi danh học viên vào lớp thành công!");
        onSuccess();
      }
    } catch (error) {
      console.error("Error enrolling student:", error);
      toast.error(
        error.response?.data?.message || "Không thể ghi danh học viên"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📝 Ghi danh học viên: ${student.fullName}`}
      size="medium"
    >
      <form onSubmit={handleEnroll} className="space-y-4">
        {/* Student Info */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <p className="text-sm">
            <span className="font-medium">Mã học viên:</span>{" "}
            {student.studentCode || "Chưa có"}
          </p>
          <p className="text-sm">
            <span className="font-medium">Email:</span> {student.email || "N/A"}
          </p>
          <p className="text-sm">
            <span className="font-medium">Số điện thoại:</span>{" "}
            {student.user?.phone || "N/A"}
          </p>
        </div>

        {/* Class Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Chọn lớp học *
          </label>
          {loadingClasses ? (
            <div className="flex justify-center py-4">
              <Loading size="small" />
            </div>
          ) : (
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">-- Chọn lớp học --</option>
              {classes.map((classItem) => (
                <option
                  key={classItem._id}
                  value={classItem._id}
                  disabled={classItem.isFull}
                >
                  {classItem.name} - {classItem.course?.name} (
                  {classItem.isFull
                    ? "Đã đầy"
                    : `Còn ${classItem.availableSlots} chỗ`}
                  )
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Sau khi ghi danh, hệ thống sẽ tự động tạo hóa đơn học phí cho học
            viên.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Ghi danh
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentManagementPage;
