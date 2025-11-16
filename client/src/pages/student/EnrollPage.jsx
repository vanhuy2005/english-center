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
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    address: "",
    note: ""
  });
  const [consultForm, setConsultForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    note: ""
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAll({ pageSize: 100, status: 'active' });
      console.log('Courses response:', response);
      // Backend trả về paginated response: { data: [...], pagination: {...} }
      const coursesData = Array.isArray(response?.data) ? response.data : 
                          Array.isArray(response) ? response : [];
      setCourses(coursesData);
      console.log('Courses set:', coursesData);
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error("Không thể tải danh sách khóa học!");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const handleConsultClick = (course) => {
    setSelectedCourse(course);
    setShowConsultModal(true);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiClient.post('/student/requests/course-enrollment', {
        courseId: selectedCourse._id,
        reason: enrollForm.note || `Đăng ký khóa học ${selectedCourse.name}`
      });
      
      if (data.success) {
        toast.success(`Đăng ký khóa học thành công! Học phí: ${formatCurrency(data.data.amount)}`);
        setShowEnrollModal(false);
        setEnrollForm({ fullName: "", phone: "", email: "", dateOfBirth: "", address: "", note: "" });
      } else {
        toast.error(data.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error('Enroll error:', error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement consult request API
      toast.success("Đã gửi yêu cầu tư vấn! Chúng tôi sẽ liên hệ bạn sớm.");
      setShowConsultModal(false);
      setConsultForm({ fullName: "", phone: "", email: "", note: "" });
    } catch (error) {
      toast.error("Gửi yêu cầu thất bại!");
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
    <div className="p-8">
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

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <Button
                    onClick={() => handleEnrollClick(course)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Đăng ký ngay
                  </Button>
                  <Button
                    onClick={() => handleConsultClick(course)}
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Đăng ký tư vấn
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Đăng ký ngay */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Đăng ký khóa học: {selectedCourse?.name}
            </h3>
            <form onSubmit={handleEnrollSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={enrollForm.fullName}
                  onChange={(e) => setEnrollForm({ ...enrollForm, fullName: e.target.value })}
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
                  value={enrollForm.phone}
                  onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
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
                  value={enrollForm.email}
                  onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={enrollForm.dateOfBirth}
                  onChange={(e) => setEnrollForm({ ...enrollForm, dateOfBirth: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={enrollForm.address}
                  onChange={(e) => setEnrollForm({ ...enrollForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={enrollForm.note}
                  onChange={(e) => setEnrollForm({ ...enrollForm, note: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập ghi chú nếu có..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  Xác nhận đăng ký
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đăng ký tư vấn */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Đăng ký tư vấn: {selectedCourse?.name}
            </h3>
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={consultForm.fullName}
                  onChange={(e) => setConsultForm({ ...consultForm, fullName: e.target.value })}
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
                  onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
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
                  onChange={(e) => setConsultForm({ ...consultForm, email: e.target.value })}
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
                  onChange={(e) => setConsultForm({ ...consultForm, note: e.target.value })}
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
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
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
