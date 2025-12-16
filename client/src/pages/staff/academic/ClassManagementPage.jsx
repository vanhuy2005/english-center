import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  Calendar,
  User,
  X,
  Edit,
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Select,
  Modal,
} from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const ClassManagementPage = () => {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Form states
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [newClassForm, setNewClassForm] = useState({
    className: "",
    classCode: "",
    course: "",
    teacher: "",
    capacity: 20,
    startDate: "",
    endDate: "",
    schedule: "",
    room: "",
    status: "scheduled",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchClasses(), fetchCourses(), fetchTeachers()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      setError(null);
      const response = await api.get("/classes");
      const data = response.data?.data || response.data || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Classes endpoint not available:", error);
      if (error.response?.status === 404) {
        setError("endpoint_not_found");
        // Set mock data for display
        setClasses([
          {
            _id: "mock1",
            className: "CLS1",
            classCode: "CLS1",
            status: "ongoing",
            course: null,
            teacher: null,
            students: [{}],
            capacity: 12,
            startDate: "2025-01-02",
            endDate: "2025-05-31",
            schedule: "T2, T4, T6 - 18h-20h",
            room: "P101",
          },
          {
            _id: "mock2",
            className: "CLS2",
            classCode: "CLS2",
            status: "ongoing",
            course: null,
            teacher: null,
            students: [{}],
            capacity: 15,
            startDate: "2025-01-15",
            endDate: "2025-04-15",
            schedule: "T3, T5, T7 - 18h-20h",
            room: "P102",
          },
        ]);
      } else {
        toast.error("Không thể tải danh sách lớp học");
        setClasses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      const data = response.data?.data || response.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Courses endpoint not available:", error);
      setCourses([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/staffs?staffType=teacher");
      const data = response.data?.data || response.data || [];
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Teachers endpoint not available:", error);
      setTeachers([]);
    }
  };

  const handleViewDetail = (cls) => {
    setSelectedClass(cls);
    setShowDetailModal(true);
  };

  const handleAssignTeacher = (cls) => {
    setSelectedClass(cls);
    setAssignTeacherId(cls.teacher?._id || "");
    setShowAssignModal(true);
  };

  const handleSubmitAssign = async () => {
    try {
      await api.put(`/classes/${selectedClass._id}`, {
        teacher: assignTeacherId,
      });
      toast.success("Phân công giáo viên thành công");
      setShowAssignModal(false);
      fetchClasses();
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast.error("Không thể phân công giáo viên");
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await api.post("/classes", newClassForm);
      toast.success("Tạo lớp học thành công");
      setShowCreateModal(false);
      setNewClassForm({
        className: "",
        classCode: "",
        course: "",
        teacher: "",
        capacity: 20,
        startDate: "",
        endDate: "",
        schedule: "",
        room: "",
        status: "scheduled",
      });
      fetchClasses();
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error(error.response?.data?.message || "Không thể tạo lớp học");
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      scheduled: { label: "Sắp khai giảng", variant: "warning" },
      ongoing: { label: "Đang học", variant: "success" },
      completed: { label: "Đã kết thúc", variant: "secondary" },
      cancelled: { label: "Đã hủy", variant: "danger" },
    };
    return statusMap[status] || { label: status, variant: "default" };
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-[#3B9797]" />
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo lớp mới
        </Button>
      </div>

      {/* Error Alert */}
      {error === "endpoint_not_found" && (
        <Card className="border-l-4 border-blue-500 bg-blue-50">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-blue-600" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900">
                Chế độ hiển thị mẫu
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                API endpoint chưa được triển khai. Dữ liệu hiển thị là dữ liệu
                mẫu.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm lớp học (tên, mã lớp)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Class List */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => {
            const statusInfo = getStatusBadge(cls.status);
            const enrolledCount = cls.students?.length || 0;
            const capacity = cls.capacity || 0;
            const fillRate =
              capacity > 0 ? Math.round((enrolledCount / capacity) * 100) : 0;

            return (
              <Card key={cls._id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {cls.className}
                      </h3>
                      <p className="text-sm text-gray-500">{cls.classCode}</p>
                    </div>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>
                        Khóa học: {cls.course?.courseName || "Chưa có"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        GV: {cls.teacher?.fullName || "Chưa phân công"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        Học viên: {enrolledCount}/{capacity} ({fillRate}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(cls.startDate).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(cls.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetail(cls)}
                    >
                      Chi tiết
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAssignTeacher(cls)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Phân công GV
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có lớp học
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Không tìm thấy lớp học nào phù hợp"
                : "Hiện tại chưa có lớp học nào trong hệ thống"}
            </p>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết lớp học"
        size="lg"
      >
        {selectedClass && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tên lớp</p>
                  <p className="font-medium">{selectedClass.className}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã lớp</p>
                  <p className="font-medium">{selectedClass.classCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <Badge variant={getStatusBadge(selectedClass.status).variant}>
                    {getStatusBadge(selectedClass.status).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sức chứa</p>
                  <p className="font-medium">
                    {selectedClass.students?.length || 0}/
                    {selectedClass.capacity} học viên
                  </p>
                </div>
              </div>
            </div>

            {/* Course & Teacher Info */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">
                Khóa học & Giảng viên
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Khóa học</p>
                  <p className="font-medium">
                    {selectedClass.course?.name ||
                      selectedClass.course?.courseName ||
                      "Chưa có"}
                  </p>
                  {selectedClass.course?.courseCode && (
                    <p className="text-xs text-gray-500">
                      Mã: {selectedClass.course.courseCode}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giáo viên</p>
                  <p className="font-medium">
                    {selectedClass.teacher?.fullName || "Chưa phân công"}
                  </p>
                  {selectedClass.teacher?.staffCode && (
                    <p className="text-xs text-gray-500">
                      Mã: {selectedClass.teacher.staffCode}
                    </p>
                  )}
                  {selectedClass.teacher?.phone && (
                    <p className="text-xs text-gray-500">
                      SĐT: {selectedClass.teacher.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">
                Lịch học & Địa điểm
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                  <p className="font-medium">
                    {new Date(selectedClass.startDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày kết thúc</p>
                  <p className="font-medium">
                    {new Date(selectedClass.endDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lịch học</p>
                  <p className="font-medium">
                    {typeof selectedClass.schedule === "string"
                      ? selectedClass.schedule
                      : selectedClass.schedule?.dayOfWeek
                      ? `${selectedClass.schedule.dayOfWeek} ${selectedClass.schedule.startTime}-${selectedClass.schedule.endTime}`
                      : "Chưa có thông tin"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phòng học</p>
                  <p className="font-medium">
                    {selectedClass.room || "Chưa có thông tin"}
                  </p>
                </div>
              </div>
            </div>

            {/* Students List */}
            {selectedClass.students && selectedClass.students.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">
                  Danh sách học viên ({selectedClass.students.length})
                </h3>
                <div className="max-h-48 overflow-y-auto bg-gray-50 rounded p-3">
                  <ul className="space-y-2">
                    {selectedClass.students.map((student, index) => {
                      // Handle both student objects and enrollment objects
                      const studentData = student.student || student;
                      const studentName =
                        studentData?.fullName ||
                        studentData?.user?.fullName ||
                        "Học viên";
                      const studentCode = studentData?.studentCode || "N/A";

                      return (
                        <li
                          key={student._id || index}
                          className="text-sm flex items-center gap-2"
                        >
                          <span className="w-6 text-gray-500">
                            {index + 1}.
                          </span>
                          <span className="font-medium">{studentName}</span>
                          {studentCode && studentCode !== "N/A" && (
                            <span className="text-gray-500">
                              ({studentCode})
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleAssignTeacher(selectedClass);
                }}
              >
                Phân công giáo viên
              </Button>
            </div>
          </div>
        )}
        {!selectedClass && (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        )}
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Phân công giáo viên"
      >
        {selectedClass && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Lớp học: <strong>{selectedClass.className}</strong>
              </p>
            </div>
            <Select
              label="Chọn giáo viên"
              value={assignTeacherId}
              onChange={(e) => setAssignTeacherId(e.target.value)}
              required
            >
              <option value="">-- Chọn giáo viên --</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.fullName} ({teacher.staffCode})
                </option>
              ))}
            </Select>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAssignModal(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleSubmitAssign} disabled={!assignTeacherId}>
                Xác nhận
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Class Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo lớp học mới"
        size="lg"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên lớp"
              required
              value={newClassForm.className}
              onChange={(e) =>
                setNewClassForm({
                  ...newClassForm,
                  className: e.target.value,
                })
              }
              placeholder="VD: Tiếng Anh Giao Tiếp Cơ Bản"
            />
            <Input
              label="Mã lớp"
              required
              value={newClassForm.classCode}
              onChange={(e) =>
                setNewClassForm({
                  ...newClassForm,
                  classCode: e.target.value,
                })
              }
              placeholder="VD: CLS001"
            />
            <Select
              label="Khóa học"
              required
              value={newClassForm.course}
              onChange={(e) =>
                setNewClassForm({ ...newClassForm, course: e.target.value })
              }
            >
              <option value="">-- Chọn khóa học --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </Select>
            <Select
              label="Giáo viên"
              value={newClassForm.teacher}
              onChange={(e) =>
                setNewClassForm({ ...newClassForm, teacher: e.target.value })
              }
            >
              <option value="">-- Chọn giáo viên (tùy chọn) --</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.fullName} ({teacher.staffCode})
                </option>
              ))}
            </Select>
            <Input
              label="Sức chứa"
              type="number"
              required
              value={newClassForm.capacity}
              onChange={(e) =>
                setNewClassForm({
                  ...newClassForm,
                  capacity: parseInt(e.target.value),
                })
              }
              min="1"
            />
            <Select
              label="Trạng thái"
              value={newClassForm.status}
              onChange={(e) =>
                setNewClassForm({ ...newClassForm, status: e.target.value })
              }
            >
              <option value="scheduled">Sắp khai giảng</option>
              <option value="ongoing">Đang học</option>
              <option value="completed">Đã kết thúc</option>
            </Select>
            <Input
              label="Ngày bắt đầu"
              type="date"
              required
              value={newClassForm.startDate}
              onChange={(e) =>
                setNewClassForm({
                  ...newClassForm,
                  startDate: e.target.value,
                })
              }
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              required
              value={newClassForm.endDate}
              onChange={(e) =>
                setNewClassForm({ ...newClassForm, endDate: e.target.value })
              }
            />
            <Input
              label="Lịch học"
              value={newClassForm.schedule}
              onChange={(e) =>
                setNewClassForm({ ...newClassForm, schedule: e.target.value })
              }
              placeholder="VD: T2, T4, T6 - 18h-20h"
            />
            <Input
              label="Phòng học"
              value={newClassForm.room}
              onChange={(e) =>
                setNewClassForm({ ...newClassForm, room: e.target.value })
              }
              placeholder="VD: P101"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Tạo lớp học</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassManagementPage;
