import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Loading,
  Badge,
  Modal,
  Input,
} from "../../../components/common";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  BookOpen,
  Calendar,
  Plus,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff/enrollment/students/${id}`);
      console.log("📚 Student detail response:", response.data);

      const responseData = response.data?.data || response.data;
      console.log("📚 Response data:", responseData);

      // Handle if the response is a success response with data wrapper
      const studentData = responseData?.student || responseData;
      console.log("📚 Student data:", studentData);

      setStudent(studentData);

      // Get student's classes from the response
      const classesData = responseData?.classes || studentData?.classes || [];
      const enrollmentData = studentData?.enrollmentHistory || [];

      setEnrollments(
        Array.isArray(classesData)
          ? classesData
          : Array.isArray(enrollmentData)
          ? enrollmentData
          : []
      );
    } catch (error) {
      console.error("Error fetching student details:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin học viên"
      );
      navigate("/enrollment/classes");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentSuccess = () => {
    setIsEnrollModalOpen(false);
    // Refresh student data
    fetchStudentDetail();
    toast.success("Ghi danh thành công!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Không tìm thấy thông tin học viên</p>
        <Button onClick={() => navigate("/enrollment/classes")}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Học Viên</h1>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User size={48} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {student.fullName}
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>
                    <strong>Mã học viên:</strong> {student.studentCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    <strong>Ngày sinh:</strong>{" "}
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Trạng thái
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Trạng thái học viên</p>
              <Badge
                variant={
                  student.status === "active"
                    ? "success"
                    : student.status === "inactive"
                    ? "error"
                    : "warning"
                }
              >
                {student.status === "active"
                  ? "Đang học"
                  : student.status === "inactive"
                  ? "Bị khóa"
                  : "Tạm dừng"}
              </Badge>
            </div>
            {student.enrollmentDate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Ngày đăng ký</p>
                <p className="font-medium">
                  {new Date(student.enrollmentDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Thông Tin Liên Hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <Mail size={16} />
              Email
            </label>
            <p className="font-medium text-gray-900">
              {student.email || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <Phone size={16} />
              Số điện thoại
            </label>
            <p className="font-medium text-gray-900">
              {student.phone || "N/A"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <MapPin size={16} />
              Địa chỉ
            </label>
            <p className="font-medium text-gray-900">
              {student.address || "N/A"}
            </p>
          </div>
        </div>
      </Card>

      {/* Enrollments */}
      {enrollments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <BookOpen size={20} />
            Khóa Học Đã Đăng Ký
          </h3>
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {enrollment.course?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {enrollment.course?.courseCode || ""}
                  </p>
                </div>
                <Badge
                  variant={
                    enrollment.status === "active" ? "success" : "warning"
                  }
                >
                  {enrollment.status === "active"
                    ? "Đang học"
                    : "Đã hoàn thành"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Button
          variant="primary"
          onClick={() => setIsEnrollModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Ghi Danh Lớp Học
        </Button>
      </div>

      {/* Enroll Modal */}
      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        student={student}
        onSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
};

// Enroll Student Modal Component
const EnrollStudentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
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
        params: { limit: 100 }, // Fetch all classes without status filter
      });
      console.log("🔍 Classes API Response:", response.data);

      // Handle response structure - the API returns { success, data: { classes, pagination } }
      let classList = [];
      if (response.data?.success && response.data?.data?.classes) {
        classList = response.data.data.classes;
        console.log("📚 Classes from response.data.data.classes:", classList);
      } else if (response.data?.classes) {
        classList = response.data.classes;
        console.log("📚 Classes from response.data.classes:", classList);
      } else if (Array.isArray(response.data)) {
        classList = response.data;
        console.log("📚 Classes from direct array:", classList);
      } else {
        console.warn("⚠️ Unexpected API response structure:", response.data);
      }

      console.log("📊 Total classes loaded:", classList.length);
      setClasses(classList);
    } catch (error) {
      console.error("❌ Error fetching classes:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error details:", error.message);
      toast.error("Không thể tải danh sách lớp học");
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSelectClass = (classId) => {
    setSelectedClass(classId);
    const classDetail = classes.find((c) => c._id === classId);
    setSelectedClassDetail(classDetail);
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
        setSelectedClass("");
        setSelectedClassDetail(null);
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
      size="large"
    >
      <form onSubmit={handleEnroll} className="space-y-4">
        {/* Student Info */}
        <div className="p-4 bg-blue-50 rounded-lg space-y-2 border border-blue-200">
          <p className="text-sm">
            <span className="font-medium">Mã học viên:</span>{" "}
            {student.studentCode || "Chưa có"}
          </p>
          <p className="text-sm">
            <span className="font-medium">Họ tên:</span> {student.fullName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Email:</span> {student.email || "N/A"}
          </p>
          <p className="text-sm">
            <span className="font-medium">Số điện thoại:</span>{" "}
            {student.phone || "N/A"}
          </p>
        </div>

        {/* Class Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Chọn lớp học *
          </label>
          {loadingClasses ? (
            <div className="flex justify-center py-6">
              <Loading size="small" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Không có lớp học nào khả dụng</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {classes.map((classItem) => (
                <div
                  key={classItem._id}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    selectedClass === classItem._id
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${classItem.isFull ? "opacity-60" : ""}`}
                  onClick={() =>
                    !classItem.isFull && handleSelectClass(classItem._id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {classItem.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {classItem.course?.name} ({classItem.course?.courseCode}
                        )
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <p>
                          <span className="text-gray-600">Giáo viên:</span>{" "}
                          <span className="font-medium">
                            {classItem.teacher?.fullName || "Chưa assign"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Phòng:</span>{" "}
                          <span className="font-medium">
                            {classItem.room || "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Ngày bắt đầu:</span>{" "}
                          <span className="font-medium">
                            {new Date(classItem.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Sức chứa:</span>{" "}
                          <span className="font-medium">
                            {classItem.currentEnrollment}/{classItem.capacity}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={classItem.isFull ? "danger" : "success"}
                      className="ml-2"
                    >
                      {classItem.isFull
                        ? "Đã đầy"
                        : `Còn ${classItem.availableSlots}`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Class Details */}
        {selectedClassDetail && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
            <p className="font-medium text-green-900">
              ✓ Thông tin lớp học đã chọn
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <span className="text-gray-600">Lớp:</span>{" "}
                {selectedClassDetail.name}
              </p>
              <p>
                <span className="text-gray-600">Mã lớp:</span>{" "}
                {selectedClassDetail.classCode || "N/A"}
              </p>
              <p>
                <span className="text-gray-600">Khóa học:</span>{" "}
                {selectedClassDetail.course?.name}
              </p>
              <p>
                <span className="text-gray-600">Học phí:</span>{" "}
                {selectedClassDetail.course?.tuitionFee?.toLocaleString(
                  "vi-VN"
                )}
                đ
              </p>
              <p>
                <span className="text-gray-600">Khoá học:</span>{" "}
                {typeof selectedClassDetail.course?.duration === "object"
                  ? `${selectedClassDetail.course.duration?.weeks || 0} tuần (${
                      selectedClassDetail.course.duration?.hours || 0
                    } giờ)`
                  : `${selectedClassDetail.course?.duration} tháng`}
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!selectedClass || loading}
            loading={loading}
          >
            Xác Nhận Ghi Danh
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentDetailPage;
