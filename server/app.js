import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import api from "@services/api";
import { Card, Loading } from "@components/common";
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
      const response = await api.post("/student/course-enrollments", {
        courseId: selectedCourse._id,
        studentId: user?.id,
      });

      if (response.data.success) {
        alert("Đăng ký khóa học thành công!");
        setShowConfirmModal(false);
        setSelectedCourse(null);
        loadCourses();
        setTimeout(() => {
          navigate("/student/my-courses");
        }, 1000);
      }
    } catch (error) {
      console.error("Enroll error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi đăng ký khóa học";
      alert("Lỗi: " + errorMsg);
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
                    onClick={() => navigate(`/student/courses/${course._id}`)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Xác Nhận Đăng Ký
              </h2>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedCourse(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Course Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">
                {selectedCourse.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Thời lượng:</span>{" "}
                  {selectedCourse.duration?.hours || 60} giờ
                </p>
                <p>
                  <span className="font-medium">Số buổi:</span>{" "}
                  {selectedCourse.duration?.weeks || 12} tuần
                </p>
                <p>
                  <span className="font-medium">Học phí:</span>{" "}
                  <span className="text-red-600 font-bold">
                    {(selectedCourse.tuition || 0).toLocaleString("vi-VN")} ₫
                  </span>
                </p>
                <p>
                  <span className="font-medium">Bắt đầu:</span>{" "}
                  {new Date(selectedCourse.startDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Thông tin đăng ký
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Tên:</span> {user?.fullName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="font-medium">Điện thoại:</span>{" "}
                  {user?.phone || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            {/* Confirmation Text */}
            <p className="text-sm text-gray-600 mb-6">
              Bằng cách click "Xác Nhận Đăng Ký", bạn đồng ý với điều khoản và
              điều kiện của khóa học này.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleEnrollConfirm}
                disabled={enrolling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? "Đang xử lý..." : "Xác Nhận Đăng Ký"}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedCourse(null);
                }}
                disabled={enrolling}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnrollPage;
