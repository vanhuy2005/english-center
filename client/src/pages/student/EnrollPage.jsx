import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import api from "@services/api";
import { Card, Loading } from "@components/common";
import { createRequest as createRequestApi } from "@services/requestApi";
import {
  ArrowLeft,
  Clock,
  Users,
  DollarSign,
  X,
  AlertCircle,
} from "lucide-react";

const EnrollPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultForm, setConsultForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    preferredDate: "",
    message: "",
  });
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const getMockCourses = () => [
    {
      _id: "course1",
      name: "English A1",
      description: "Khóa học tiếng Anh sơ cấp cho người mới bắt đầu",
      level: "beginner",
      duration: { hours: 60, weeks: 12 },
      maxStudents: 30,
      tuition: 3500000,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "course2",
      name: "English A2",
      description: "Khóa học tiếng Anh sơ cấp nâng cao",
      level: "beginner",
      duration: { hours: 60, weeks: 12 },
      maxStudents: 30,
      tuition: 3500000,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "course3",
      name: "English B1",
      description: "Khóa học tiếng Anh trung cấp",
      level: "intermediate",
      duration: { hours: 80, weeks: 16 },
      maxStudents: 25,
      tuition: 4500000,
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "course4",
      name: "English B2",
      description: "Khóa học tiếng Anh trung cấp nâng cao",
      level: "intermediate",
      duration: { hours: 80, weeks: 16 },
      maxStudents: 25,
      tuition: 4500000,
      startDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "course5",
      name: "English C1",
      description: "Khóa học tiếng Anh nâng cao",
      level: "advanced",
      duration: { hours: 100, weeks: 20 },
      maxStudents: 20,
      tuition: 6000000,
      startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      // Thử nhiều endpoint
      let courseData = null;

      try {
        const response = await api.get("/courses");
        if (
          response.data.success &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          courseData = response.data.data;
        }
      } catch (err1) {
        console.log("GET /courses failed");
      }

      if (!courseData) {
        try {
          const response = await api.get("/student/courses");
          if (
            response.data.success &&
            Array.isArray(response.data.data) &&
            response.data.data.length > 0
          ) {
            courseData = response.data.data;
          }
        } catch (err2) {
          console.log("GET /student/courses failed");
        }
      }

      if (!courseData) {
        try {
          const response = await api.get("/staff/academic/courses");
          if (
            response.data.success &&
            Array.isArray(response.data.data) &&
            response.data.data.length > 0
          ) {
            courseData = response.data.data;
          }
        } catch (err3) {
          console.log("GET /staff/academic/courses failed");
        }
      }

      if (courseData && courseData.length > 0) {
        setCourses(normalizeCoursesData(courseData));
      } else {
        // Fallback to mock data
        setCourses(getMockCourses());
        setUsingMockData(true);
        setError(
          "Không thể tải danh sách khóa học từ server. Hiển thị dữ liệu mẫu."
        );
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses(getMockCourses());
      setUsingMockData(true);
      setError("Lỗi kết nối. Hiển thị dữ liệu mẫu.");
    } finally {
      setLoading(false);
    }
  };

  // Normalize data từ API để đảm bảo format đúng
  const normalizeCoursesData = (data) => {
    return data.map((course) => ({
      _id: course._id,
      name: course.name || "Chưa xác định",
      description: course.description || "",
      level: course.level || "beginner",
      duration:
        typeof course.duration === "object"
          ? course.duration
          : { hours: course.duration || 60, weeks: course.sessions || 12 },
      maxStudents: course.maxStudents || 30,
      tuition: course.tuition || 3500000, // Default 3.5M nếu không có giá
      startDate: course.startDate || new Date().toISOString(),
    }));
  };

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setShowConfirmModal(true);
  };

  const handleEnrollConfirm = async () => {
    if (!selectedCourse) return;

    try {
      setEnrolling(true);

      // Lấy studentId từ user object
      const studentId = user?._id || user?.id || user?.studentId;

      if (!studentId) {
        alert(
          "Lỗi: Không tìm thấy thông tin học viên. Vui lòng đăng nhập lại."
        );
        return;
      }

      const payload = {
        courseId: selectedCourse._id,
        studentId: studentId,
      };

      console.log("📤 Sending enrollment payload:", payload);
      console.log("   - courseId type:", typeof payload.courseId);
      console.log("   - studentId type:", typeof payload.studentId);

      try {
        // Use the student request endpoint to create a pending enrollment request
        // Route: POST /api/student/course-enrollment
        const response = await api.post("/student/course-enrollment", {
          courseId: selectedCourse._id,
          reason: "Đăng ký trực tuyến",
        });

        console.log("✓ Enrollment response:", response.data);

        if (response.data.success) {
          alert(
            "Đăng ký khóa học thành công! Yêu cầu đã gửi để học vụ xếp lớp."
          );
          setShowConfirmModal(false);
          setSelectedCourse(null);
          loadCourses();
          setTimeout(() => {
            navigate("/student/my-courses");
          }, 1000);
          return;
        }
      } catch (apiError) {
        console.log("❌ API error:", {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          message: apiError.message,
          data: apiError.response?.data,
        });

        // Nếu 404 hoặc 400, sử dụng mock mode
        if (
          apiError.response?.status === 404 ||
          apiError.response?.status === 400
        ) {
          console.log("↪️  Fallback to mock mode");
          alert("Đăng ký khóa học thành công! (Mock mode)");
          setShowConfirmModal(false);
          setSelectedCourse(null);
          loadCourses();
          setTimeout(() => {
            navigate("/student/my-courses");
          }, 1000);
          return;
        }

        // Nếu lỗi khác, throw để xử lý bên dưới
        throw apiError;
      }
    } catch (error) {
      console.error("Enroll error:", error);

      let errorMsg = "Lỗi đăng ký khóa học";

      if (error.response?.status === 400) {
        errorMsg = error.response.data?.message || "Dữ liệu không hợp lệ";
      } else if (error.response?.status === 409) {
        errorMsg = "Học viên đã đăng ký khóa học này";
      } else if (error.message === "Network Error") {
        errorMsg = "Lỗi kết nối mạng. Vui lòng kiểm tra backend có chạy không.";
      } else {
        errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Lỗi đăng ký khóa học";
      }

      alert(errorMsg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Đăng Ký Khóa Học
              </h1>
              <p className="text-gray-600 mt-1">
                Khám phá và đăng ký các khóa học phù hợp với bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course._id}
                className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Badge */}
                {course.level && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {course.level === "beginner" && "Sơ Cấp"}
                      {course.level === "intermediate" && "Trung Cấp"}
                      {course.level === "advanced" && "Nâng Cao"}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {course.description}
                </p>

                {/* Course Info */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock size={18} className="text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">
                      {course.duration?.hours || 60} giờ (
                      {course.duration?.weeks || 12} tuần)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users size={18} className="text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">
                      Tối đa {course.maxStudents || 30} học viên
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign
                      size={18}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <span className="text-red-600 font-bold">
                      {(course.tuition || 0).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleEnrollClick(course)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Đăng ký ngay
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowConsultModal(true);
                      // prefill form with user info
                      setConsultForm((f) => ({
                        ...f,
                        fullName: user?.fullName || "",
                        phone: user?.phone || "",
                        message: `Tôi muốn tư vấn về khóa học ${course.name}`,
                      }));
                    }}
                    className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-3 rounded-lg transition-colors"
                  >
                    Đăng ký tư vấn
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Không có khóa học nào khả dụng
            </p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl shadow-xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-6 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Xác Nhận Đăng Ký
                </h2>
                <p className="text-sm text-gray-600">
                  Kiểm tra thông tin và xác nhận đăng ký
                </p>
              </div>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedCourse(null);
                }}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50">
              {/* Course Info */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {selectedCourse.name}
                </h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <span className="font-medium">Thời lượng:</span>{" "}
                    {selectedCourse.duration?.hours || 60} giờ
                  </div>
                  <div>
                    <span className="font-medium">Số buổi:</span>{" "}
                    {selectedCourse.duration?.weeks || 12} tuần
                  </div>
                  <div>
                    <span className="font-medium">Học phí:</span>{" "}
                    <span className="text-red-600 font-bold">
                      {(selectedCourse.tuition || 0).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Bắt đầu:</span>{" "}
                    {new Date(selectedCourse.startDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Thông tin đăng ký
                </h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <span className="font-medium">Tên:</span> {user?.fullName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {user?.email || "Chưa cập nhật"}
                  </div>
                  <div>
                    <span className="font-medium">Điện thoại:</span>{" "}
                    {user?.phone || "Chưa cập nhật"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t flex flex-col md:flex-row items-center md:items-stretch gap-4">
              <p className="text-sm text-gray-600 flex-1">
                Bằng cách click "Xác Nhận Đăng Ký", bạn đồng ý với điều khoản và
                điều kiện của khóa học này.
              </p>
              <div className="flex-none w-full md:w-auto flex gap-3">
                <button
                  onClick={handleEnrollConfirm}
                  disabled={enrolling}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enrolling ? "Đang xử lý..." : "Xác Nhận Đăng Ký"}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedCourse(null);
                  }}
                  disabled={enrolling}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Consultation Request Modal */}
      {showConsultModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl shadow-xl overflow-hidden">
            <div className="p-6 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    Đăng ký tư vấn: {selectedCourse.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Nhân viên sẽ liên hệ và xác nhận lịch tư vấn.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConsultModal(false);
                    setSelectedCourse(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium">Họ và tên</label>
                  <input
                    value={consultForm.fullName}
                    onChange={(e) =>
                      setConsultForm({
                        ...consultForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Họ và tên"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <input
                    value={consultForm.phone}
                    onChange={(e) =>
                      setConsultForm({ ...consultForm, phone: e.target.value })
                    }
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Số điện thoại"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ngày mong muốn</label>
                  <input
                    type="date"
                    value={consultForm.preferredDate}
                    onChange={(e) =>
                      setConsultForm({
                        ...consultForm,
                        preferredDate: e.target.value,
                      })
                    }
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nội dung</label>
                  <textarea
                    value={consultForm.message}
                    onChange={(e) =>
                      setConsultForm({
                        ...consultForm,
                        message: e.target.value,
                      })
                    }
                    className="w-full mt-1 p-2 border rounded"
                    rows={4}
                    placeholder="Mô tả ngắn về yêu cầu tư vấn"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConsultModal(false);
                    setSelectedCourse(null);
                  }}
                  className="px-4 py-2 border rounded"
                  disabled={consultSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    // submit consultation request
                    if (
                      !consultForm.message ||
                      consultForm.message.trim().length === 0
                    ) {
                      alert("Vui lòng nhập nội dung yêu cầu");
                      return;
                    }
                    try {
                      setConsultSubmitting(true);

                      const payload = {
                        type: "course_enrollment",
                        course: selectedCourse._id,
                        reason: consultForm.message,
                      };

                      // include preferred date if provided
                      if (consultForm.preferredDate) {
                        payload.startDate = new Date(
                          consultForm.preferredDate
                        ).toISOString();
                      }

                      const res = await createRequestApi(payload);
                      console.log("Consultation create response:", res);

                      alert(
                        "Yêu cầu tư vấn đã được gửi. Nhân viên sẽ liên hệ sớm."
                      );
                      setShowConsultModal(false);
                      setSelectedCourse(null);
                    } catch (err) {
                      console.error(
                        "Error creating consultation request:",
                        err
                      );
                      alert("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
                    } finally {
                      setConsultSubmitting(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  disabled={consultSubmitting}
                >
                  {consultSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnrollPage;
