import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import api from "@services/api";
import { Loading } from "@components/common";
import { createRequest as createRequestApi } from "@services/requestApi";
import {
  ArrowLeft,
  Clock,
  Users,
  DollarSign,
  X,
  AlertCircle,
  BookOpen,
  Calendar,
  MessageSquare,
} from "lucide-react";

const EnrollPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Modal states
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

  useEffect(() => {
    loadCourses();
  }, []);

  // --- LOGIC FETCH DATA (GIỮ NGUYÊN, BỎ MOCK) ---
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      let courseData = null;

      // Thử nhiều endpoint như logic cũ
      try {
        const response = await api.get("/courses");
        if (response.data.success && Array.isArray(response.data.data)) {
          courseData = response.data.data;
        }
      } catch (err1) {
        console.log("GET /courses failed", err1);
      }

      if (!courseData) {
        try {
          const response = await api.get("/student/courses");
          if (response.data.success && Array.isArray(response.data.data)) {
            courseData = response.data.data;
          }
        } catch (err2) {
          console.log("GET /student/courses failed", err2);
        }
      }

      if (courseData && courseData.length > 0) {
        setCourses(normalizeCoursesData(courseData));
      } else {
        setError("Không tìm thấy khóa học nào khả dụng.");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setError("Lỗi kết nối. Không thể tải danh sách khóa học.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

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
      tuition: course.tuition ?? (course.fee && course.fee.amount) ?? 0,
      startDate: course.startDate || new Date().toISOString(),
    }));
  };

  // --- LOGIC HANDLERS (GIỮ NGUYÊN) ---
  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setShowConfirmModal(true);
  };

  const handleEnrollConfirm = async () => {
    if (!selectedCourse) return;

    try {
      setEnrolling(true);
      const studentId = user?._id || user?.id || user?.studentId;

      if (!studentId) {
        alert(
          "Lỗi: Không tìm thấy thông tin học viên. Vui lòng đăng nhập lại."
        );
        return;
      }

      try {
        const response = await api.post("/student/course-enrollment", {
          courseId: selectedCourse._id,
          reason: "Đăng ký trực tuyến",
        });

        if (response.data.success) {
          alert(
            "Đăng ký khóa học thành công! Yêu cầu đã gửi để học vụ xếp lớp."
          );
          setShowConfirmModal(false);
          setSelectedCourse(null);
          loadCourses();
          setTimeout(() => navigate("/student/my-courses"), 1000);
          return;
        }
      } catch (apiError) {
        // Xử lý lỗi API chi tiết
        let errorMsg = "Lỗi đăng ký khóa học";
        if (apiError.response?.status === 400) {
          errorMsg = apiError.response.data?.message || "Dữ liệu không hợp lệ";
        } else if (apiError.response?.status === 409) {
          errorMsg = "Bạn đã đăng ký khóa học này rồi.";
        } else {
          errorMsg = apiError.response?.data?.message || apiError.message;
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Enroll error:", error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleConsultSubmit = async () => {
    if (!consultForm.message || consultForm.message.trim().length === 0) {
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
      if (consultForm.preferredDate) {
        payload.startDate = new Date(consultForm.preferredDate).toISOString();
      }

      await createRequestApi(payload);
      alert("Yêu cầu tư vấn đã được gửi. Nhân viên sẽ liên hệ sớm.");
      setShowConsultModal(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error("Error creating consultation request:", err);
      alert("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setConsultSubmitting(false);
    }
  };

  // Helper styles
  const getLevelBadgeStyle = (level) => {
    switch (level) {
      case "beginner":
        return "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]";
      case "intermediate":
        return "bg-amber-50 text-amber-700";
      case "advanced":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case "beginner":
        return "Sơ cấp";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      default:
        return "Cơ bản";
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-6 md:p-8">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student")}
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <BookOpen size={20} className="text-white" />
                </div>
                Đăng Ký Khóa Học
              </h1>
              <p className="text-gray-500 text-sm mt-1 ml-12">
                Khám phá các khóa học mới phù hợp với trình độ của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-[var(--color-danger)]" size={20} />
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="group bg-white rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
              >
                {/* Card Header */}
                <div className="p-6 pb-4 border-b border-gray-50 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getLevelBadgeStyle(
                        course.level
                      )}`}
                    >
                      {getLevelLabel(course.level)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                      <Calendar size={12} />
                      {new Date(course.startDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--color-primary)] mb-2 line-clamp-2 h-[3.5rem] group-hover:text-[var(--color-secondary)] transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                    {course.description}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6 py-4 flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock
                          size={16}
                          className="text-[var(--color-secondary)]"
                        />
                        <span>Thời lượng</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {course.duration?.hours}h ({course.duration?.weeks}{" "}
                        tuần)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users
                          size={16}
                          className="text-[var(--color-secondary)]"
                        />
                        <span>Sĩ số</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        Max {course.maxStudents} HV
                      </span>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-sm text-gray-500">Học phí</span>
                      <span className="text-lg font-bold text-[var(--color-danger)]">
                        {course.tuition?.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer (Actions) */}
                <div className="p-6 pt-0 mt-auto flex gap-3">
                  <button
                    onClick={() => handleEnrollClick(course)}
                    className="flex-1 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Đăng ký
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowConsultModal(true);
                      setConsultForm((f) => ({
                        ...f,
                        fullName: user?.fullName || "",
                        phone: user?.phone || "",
                        message: `Tôi muốn tư vấn về khóa học ${course.name}`,
                      }));
                    }}
                    className="px-3 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
                    title="Tư vấn thêm"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <BookOpen size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                Hiện tại chưa có khóa học nào mở đăng ký
              </p>
            </div>
          )
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Confirm Modal */}
      {showConfirmModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--color-primary)]">
                Xác nhận đăng ký
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-[var(--color-primary)] mb-1">
                  {selectedCourse.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Học phí:{" "}
                  <span className="font-bold text-[var(--color-danger)]">
                    {selectedCourse.tuition?.toLocaleString()} ₫
                  </span>
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Học viên:</span>{" "}
                  {user?.fullName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="italic text-xs mt-2">
                  * Bằng cách xác nhận, yêu cầu đăng ký của bạn sẽ được gửi đến
                  bộ phận giáo vụ để xếp lớp.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                disabled={enrolling}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleEnrollConfirm}
                className="flex-1 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-light)] flex justify-center items-center gap-2"
                disabled={enrolling}
              >
                {enrolling && <Loading size="sm" color="white" />}
                {enrolling ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consult Modal */}
      {showConsultModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--color-primary)]">
                Đăng ký tư vấn
              </h3>
              <button
                onClick={() => setShowConsultModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Họ tên
                  </label>
                  <input
                    value={consultForm.fullName}
                    onChange={(e) =>
                      setConsultForm({
                        ...consultForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    SĐT
                  </label>
                  <input
                    value={consultForm.phone}
                    onChange={(e) =>
                      setConsultForm({ ...consultForm, phone: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Ngày mong muốn (Không bắt buộc)
                </label>
                <input
                  type="date"
                  value={consultForm.preferredDate}
                  onChange={(e) =>
                    setConsultForm({
                      ...consultForm,
                      preferredDate: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Nội dung tư vấn
                </label>
                <textarea
                  rows={3}
                  value={consultForm.message}
                  onChange={(e) =>
                    setConsultForm({ ...consultForm, message: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none"
                  placeholder="Ví dụ: Tôi muốn hỏi về lịch học buổi tối..."
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowConsultModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                disabled={consultSubmitting}
              >
                Đóng
              </button>
              <button
                onClick={handleConsultSubmit}
                className="flex-1 py-2.5 bg-[var(--color-secondary)] text-white font-bold rounded-lg hover:bg-[var(--color-secondary-dark)] flex justify-center items-center gap-2"
                disabled={consultSubmitting}
              >
                {consultSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollPage;
