import { useState, useEffect } from "react";
import { courseService, classService } from "../../services";
import apiClient from "@services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/common";
import { Badge } from "@components/common";
import { Button } from "@components/common";
import { BookOpen, Clock, Users, DollarSign, Search } from "lucide-react";
import toast from "react-hot-toast";

const EnrollPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showPlacementTestModal, setShowPlacementTestModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollModalType, setEnrollModalType] = useState("course"); // "course" | "placement_test"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    address: "",
    note: "",
    desiredTestDate: "", // Ngày thi mong muốn
  });
  const [consultForm, setConsultForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    note: "",
  });

  useEffect(() => {
    fetchCourses();
    
    // Always show placement test modal when entering this page from sidebar
    const timer = setTimeout(() => {
      setShowPlacementTestModal(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAll({
        pageSize: 100,
        status: "active",
      });
      console.log("Courses response:", response);
      // API trả về: { success: true, message, data: [...] }
      const coursesData = response?.data?.data || response?.data || [];
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      console.log("Courses set:", coursesData);
    } catch (error) {
      console.error("Fetch courses error:", error);
      toast.error("Không thể tải danh sách khóa học!");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    // Show course enrollment form directly (no placement test modal)
    setEnrollModalType("course");
    setShowEnrollModal(true);
  };

  const handleConfirmEnroll = () => {
    // User chose "Có" - show placement test form
    setShowPlacementTestModal(false);
    setEnrollModalType("placement_test");
    setShowEnrollModal(true);
  };

  const handleSkipPlacementTest = () => {
    // User chose "Không" - just close modal and return to course list
    setShowPlacementTestModal(false);
    // Don't save to sessionStorage - modal will show again next time user enters this page
  };

  const handleConsultClick = (course = null) => {
    setSelectedCourse(course);
    setShowConsultModal(true);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    
    if (enrollModalType === "placement_test") {
      await handlePlacementTestSubmit();
    } else {
      await handleCourseEnrollSubmit();
    }
  };

  const handlePlacementTestSubmit = async () => {
    try {
      const { fullName, phone, dateOfBirth, desiredTestDate } = enrollForm;
      
      if (!fullName || !phone || !dateOfBirth || !desiredTestDate) {
        toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
        return;
      }

      setIsSubmitting(true);
      const response = await apiClient.post("/student/requests/placement-test", {
        fullName,
        phone,
        dateOfBirth,
        desiredTestDate
      });

      if (response.data.success) {
        toast.success("Đăng ký thi đầu vào thành công! Chúng tôi sẽ liên hệ với bạn trong 24h.");
        setShowEnrollModal(false);
        setEnrollForm({
          fullName: "",
          phone: "",
          email: "",
          dateOfBirth: "",
          address: "",
          note: "",
          desiredTestDate: "",
        });
      }
    } catch (error) {
      console.error("Placement test error:", error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCourseEnrollSubmit = async () => {
    try {
      const { fullName, phone, email, dateOfBirth, address, note } = enrollForm;
      
      if (!fullName || !phone || !email || !dateOfBirth || !address) {
        toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
        return;
      }

      setIsSubmitting(true);
      const response = await apiClient.post("/student/requests/course-enrollment", {
        courseId: selectedCourse._id,
        fullName,
        phone,
        email,
        dateOfBirth,
        address,
        note: note || `Đăng ký khóa học ${selectedCourse.name}`,
      });

      if (response.data.success) {
        const feeAmount = response.data.data?.amount || 0;
        toast.success(
          `Đăng ký khóa học thành công! Học phí: ${formatCurrency(feeAmount)}. Vui lòng thanh toán trong 7 ngày.`
        );
        setShowEnrollModal(false);
        setEnrollForm({
          fullName: "",
          phone: "",
          email: "",
          dateOfBirth: "",
          address: "",
          note: "",
          desiredTestDate: "",
        });
      }
    } catch (error) {
      console.error("Course enrollment error:", error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/student/requests/consultation", {
        courseId: selectedCourse?._id,
        fullName: consultForm.fullName,
        phone: consultForm.phone,
        email: consultForm.email,
        note: consultForm.note,
      });

      if (response.data.success) {
        toast.success("Đã gửi yêu cầu tư vấn! Chúng tôi sẽ liên hệ bạn sớm.");
        setShowConsultModal(false);
        setConsultForm({ fullName: "", phone: "", email: "", note: "" });
      }
    } catch (error) {
      console.error("Consultation error:", error);
      toast.error(error.response?.data?.message || "Gửi yêu cầu thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      default:
        return level;
    }
  };

  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch =
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 relative">
      {/* Floating Tư vấn Button - Fixed góc phải */}
      <button
        onClick={() => handleConsultClick(null)}
        className="fixed bottom-8 right-8 z-50 group"
        style={{ zIndex: 999 }}
      >
        <div className="relative">
          {/* Main Button */}
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-pulse">
            <span className="text-3xl">💬</span>
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium shadow-xl">
              Đăng ký tư vấn
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Đăng Ký Khóa Học
        </h1>
        <p className="text-gray-600">
          Khám phá và đăng ký các khóa học phù hợp với bạn
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterLevel("all")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterLevel === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-50"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterLevel("beginner")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterLevel === "beginner"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-50"
            }`}
          >
            Cơ bản
          </button>
          <button
            onClick={() => setFilterLevel("intermediate")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterLevel === "intermediate"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-50"
            }`}
          >
            Trung cấp
          </button>
          <button
            onClick={() => setFilterLevel("advanced")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterLevel === "advanced"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-50"
            }`}
          >
            Nâng cao
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy khóa học nào</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <Card
              key={course._id}
              className="border-t-4 border-t-red-500 hover:shadow-xl transition-all"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg text-gray-900">
                    {course.name}
                  </CardTitle>
                  <Badge className={getLevelColor(course.level)}>
                    {getLevelLabel(course.level)}
                  </Badge>
                </div>
                <CardDescription className="text-sm line-clamp-2">
                  {course.description || "Không có mô tả"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>
                      {course.duration?.hours || 0} giờ (
                      {course.duration?.weeks || 0} tuần)
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Tối đa {course.capacity?.max || 20} học viên</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-red-600">
                      {formatCurrency(course.fee?.amount || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleEnrollClick(course)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
                  >
                    Đăng ký ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Xác nhận Test đầu vào */}
      {showPlacementTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Bạn có muốn đăng ký kiểm tra đầu vào không?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bài kiểm tra đầu vào giúp chúng tôi xác định trình độ tiếng Anh của bạn để gợi ý khóa học phù hợp với năng lực.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-3">Lợi ích khi thi đầu vào:</p>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Xác định chính xác trình độ hiện tại của bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Được gợi ý khóa học phù hợp với năng lực</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Tiết kiệm thời gian và chi phí học tập</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Nền tảng vững chắc để phát triển kỹ năng</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleSkipPlacementTest}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3"
              >
                Không, cảm ơn
              </Button>
              <Button
                type="button"
                onClick={handleConfirmEnroll}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 shadow-lg"
              >
                Có, đăng ký ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đăng ký - Conditional based on enrollModalType */}
      {showEnrollModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEnrollModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - changes based on type */}
            {enrollModalType === "placement_test" ? (
              <div className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 p-8 rounded-t-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight">
                      Đăng Ký Thi Đầu Vào
                    </h3>
                  </div>
                  <p className="text-red-100 text-base ml-15">Đánh giá trình độ tiếng Anh của bạn ngay hôm nay!</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 rounded-t-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-3xl">📚</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight">
                      Đăng Ký Khóa Học
                    </h3>
                  </div>
                  <p className="text-blue-100 text-base ml-15">
                    {selectedCourse?.name}
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleEnrollSubmit}
              className="p-6"
            >
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {enrollModalType === "placement_test" ? (
                  // Placement Test Form
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={enrollForm.fullName}
                          onChange={(e) =>
                            setEnrollForm({ ...enrollForm, fullName: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-400"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={enrollForm.phone}
                          onChange={(e) =>
                            setEnrollForm({ ...enrollForm, phone: e.target.value })
                          }
                          required
                          pattern="[0-9]{10,11}"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="0123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày sinh <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={enrollForm.dateOfBirth}
                          onChange={(e) =>
                            setEnrollForm({
                              ...enrollForm,
                              dateOfBirth: e.target.value,
                            })
                          }
                          required
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày thi mong muốn <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={enrollForm.desiredTestDate}
                          onChange={(e) =>
                            setEnrollForm({
                              ...enrollForm,
                              desiredTestDate: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
                      <p className="text-sm text-red-900 flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">📅</span>
                        <span className="leading-relaxed">
                          <strong className="text-red-700">⚡ Thông tin quan trọng:</strong> Bài thi bao gồm <span className="font-semibold">Ngữ pháp, Từ vựng, Đọc hiểu và Nghe hiểu</span>. Thời gian: <span className="font-semibold text-red-600">60 phút</span>. Kết quả sẽ có trong vòng <span className="font-semibold text-red-600">24h</span> sau khi hoàn thành.
                        </span>
                      </p>
                    </div>
                  </>
                ) : (
                  // Course Enrollment Form - Full personal info like placement test
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={enrollForm.fullName}
                          onChange={(e) =>
                            setEnrollForm({ ...enrollForm, fullName: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={enrollForm.phone}
                          onChange={(e) =>
                            setEnrollForm({ ...enrollForm, phone: e.target.value })
                          }
                          required
                          pattern="[0-9]{10,11}"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="0123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={enrollForm.email}
                          onChange={(e) =>
                            setEnrollForm({ ...enrollForm, email: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="example@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày sinh <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={enrollForm.dateOfBirth}
                          onChange={(e) =>
                            setEnrollForm({
                              ...enrollForm,
                              dateOfBirth: e.target.value,
                            })
                          }
                          required
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={enrollForm.address}
                        onChange={(e) =>
                          setEnrollForm({ ...enrollForm, address: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Số nhà, đường, quận, thành phố"
                      />
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-blue-900">Khóa học:</span>
                          <span className="text-sm font-bold text-blue-700">{selectedCourse?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-blue-900">Học phí:</span>
                          <span className="text-sm font-bold text-red-600">{formatCurrency(selectedCourse?.fee?.amount || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-blue-900">Thời lượng:</span>
                          <span className="text-sm text-blue-700">{selectedCourse?.duration?.weeks || 0} tuần</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  variant="outline"
                  className="flex-1 border-2 font-medium"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 font-bold shadow-lg ${
                    enrollModalType === "placement_test"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  } text-white`}
                >
                  {enrollModalType === "placement_test" ? "Đăng ký thi" : "Xác nhận đăng ký"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đăng ký tư vấn */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Đăng ký tư vấn
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Để lại thông tin, chúng tôi sẽ liên hệ tư vấn chi tiết cho bạn
              </p>
            </div>
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={consultForm.fullName}
                  onChange={(e) =>
                    setConsultForm({ ...consultForm, fullName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={consultForm.phone}
                  onChange={(e) =>
                    setConsultForm({ ...consultForm, phone: e.target.value })
                  }
                  required
                  pattern="[0-9]{10,11}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại (10-11 số)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={consultForm.email}
                  onChange={(e) =>
                    setConsultForm({ ...consultForm, email: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung cần tư vấn
                </label>
                <textarea
                  value={consultForm.note}
                  onChange={(e) =>
                    setConsultForm({ ...consultForm, note: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập nội dung cần tư vấn..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowConsultModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                >
                  Gửi yêu cầu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollPage;
