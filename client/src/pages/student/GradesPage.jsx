import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Loading } from "@components/common";
import { getMyGrades } from "@services/gradesApi";
import {
  BarChart3,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const GradesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📥 Fetching grades...");

      const data = await getMyGrades();
      console.log("✓ Grades loaded:", data);

      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching grades:", err);
      setError("Lỗi tải điểm số");
      setGrades(getMockGrades());
    } finally {
      setLoading(false);
    }
  };

  const getMockGrades = () => [
    {
      _id: "grade_1",
      course: {
        _id: "course1",
        name: "English A1",
        code: "EN-A1",
      },
      enrollment: "enrollment1",
      midtermScore: 8.5,
      finalScore: 8.0,
      attendance: 85,
      status: "completed",
      letterGrade: "A",
    },
    {
      _id: "grade_2",
      course: {
        _id: "course2",
        name: "English A2",
        code: "EN-A2",
      },
      enrollment: "enrollment2",
      midtermScore: 7.5,
      finalScore: null,
      attendance: 90,
      status: "in-progress",
      letterGrade: null,
    },
  ];

  const getLetterGradeColor = (letterGrade) => {
    switch (letterGrade) {
      case "A":
        return "bg-green-100 text-green-700";
      case "B":
        return "bg-blue-100 text-blue-700";
      case "C":
        return "bg-yellow-100 text-yellow-700";
      case "D":
        return "bg-orange-100 text-orange-700";
      case "F":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-l-4 border-l-green-600";
      case "in-progress":
        return "bg-blue-50 border-l-4 border-l-blue-600";
      default:
        return "bg-gray-50 border-l-4 border-l-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in-progress":
        return "Đang học";
      default:
        return status;
    }
  };

  if (loading) {
    return <Loading />;
  }

  const completedGrades = grades.filter((g) => g.status === "completed");
  const averageScore =
    completedGrades.length > 0
      ? (
          completedGrades.reduce((sum, g) => sum + (g.finalScore || 0), 0) /
          completedGrades.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 size={32} className="text-blue-600" />
                Điểm Số
              </h1>
              <p className="text-gray-600 mt-1">Xem kết quả học tập của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng Khóa Học</p>
              <h3 className="text-3xl font-bold mt-2">{grades.length}</h3>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div>
              <p className="text-green-100 text-sm font-medium">Hoàn Thành</p>
              <h3 className="text-3xl font-bold mt-2">
                {completedGrades.length}
              </h3>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Điểm Trung Bình
              </p>
              <h3 className="text-3xl font-bold mt-2">{averageScore}</h3>
            </div>
          </Card>
        </div>
      </div>

      {/* Grades List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {grades.length > 0 ? (
          <div className="space-y-4">
            {grades.map((grade) => (
              <Card
                key={grade._id}
                className={`${getStatusColor(
                  grade.status
                )} p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {grade.course?.name}
                      </h3>
                      <span className="text-sm text-gray-600">
                        ({grade.course?.code})
                      </span>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Giữa kỳ</p>
                        <p className="text-lg font-bold text-gray-900">
                          {grade.midtermScore?.toFixed(1) || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Cuối kỳ</p>
                        <p className="text-lg font-bold text-gray-900">
                          {grade.finalScore?.toFixed(1) || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Chuyên Cần</p>
                        <p className="text-lg font-bold text-gray-900">
                          {grade.attendance}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Trạng Thái</p>
                        <p className="text-sm font-bold text-gray-900">
                          {getStatusLabel(grade.status)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Letter Grade Badge */}
                  {grade.letterGrade ? (
                    <div className="flex-shrink-0">
                      <div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center ${getLetterGradeColor(
                          grade.letterGrade
                        )}`}
                      >
                        <span className="text-2xl font-bold">
                          {grade.letterGrade}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-medium">
                        Đang học
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">Không có điểm số nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesPage;
