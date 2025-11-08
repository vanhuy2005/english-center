import { useState, useEffect } from "react";
import { courseService, classService } from "../../services";
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAll();
      setCourses(response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học!");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      // TODO: Implement enrollment API
      toast.success("Đăng ký khóa học thành công! Vui lòng chờ phê duyệt.");
    } catch (error) {
      toast.error("Đăng ký thất bại!");
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

  const filteredCourses = courses.filter((course) => {
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

                <div className="pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleEnroll(course._id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Đăng ký ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EnrollPage;
