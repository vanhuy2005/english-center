import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "@components/common";
import { getMyGrades } from "@services/gradesApi";
import {
  BarChart3,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  BookOpen,
  GraduationCap
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
      
      const data = await getMyGrades();
      
      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching grades:", err);
      setError("Không thể tải bảng điểm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for styling
  const getLetterGradeColor = (letterGrade) => {
    switch (letterGrade) {
      case "A":
        return "bg-[var(--color-secondary)] text-white"; // Xuất sắc
      case "B":
        return "bg-[#1d5a87] text-white"; // Giỏi (Accent)
      case "C":
        return "bg-amber-500 text-white"; // Khá
      case "D":
        return "bg-orange-500 text-white"; // Trung bình
      case "F":
        return "bg-[var(--color-danger)] text-white"; // Yếu
      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "border-l-[var(--color-secondary)]";
      case "in-progress":
        return "border-l-blue-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return <span className="text-[var(--color-secondary)] font-medium">Hoàn thành</span>;
      case "in-progress":
        return <span className="text-blue-600 font-medium">Đang học</span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  if (loading) return <Loading />;

  const completedGrades = grades.filter((g) => g.status === "completed");
  const averageScore =
    completedGrades.length > 0
      ? (
          completedGrades.reduce((sum, g) => sum + (g.finalScore || 0), 0) /
          completedGrades.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-6 md:p-8">
      {/* Container Full Width */}
      <div className="w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <BarChart3 size={20} className="text-white" />
                </div>
                Điểm Số
              </h1>
              <p className="text-gray-500 text-sm mt-1 ml-12">
                Xem kết quả và thành tích học tập
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

        {/* Stats Cards (Solid Colors) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Tổng khóa học</p>
              <h3 className="text-2xl font-bold text-[var(--color-primary)]">
                {grades.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Đã hoàn thành</p>
              <h3 className="text-2xl font-bold text-[var(--color-secondary)]">
                {completedGrades.length}
              </h3>
            </div>
            <div className="p-3 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Điểm trung bình</p>
              <h3 className="text-2xl font-bold text-purple-600">
                {averageScore}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Grades List */}
        <div>
           <h2 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
             <GraduationCap size={18} />
             Bảng điểm chi tiết
           </h2>

           {grades.length > 0 ? (
            <div className="space-y-4">
              {grades.map((grade) => (
                <div
                  key={grade._id}
                  className={`
                    group bg-white rounded-xl p-6 shadow-[var(--shadow-card)] 
                    hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300
                    border border-gray-100 border-l-4 ${getStatusColor(grade.status)}
                    w-full
                  `}
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    
                    {/* Course Info */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-[var(--color-primary)] truncate pr-4" title={grade.course?.name}>
                          {grade.course?.name || "Tên khóa học"}
                        </h3>
                        {/* Mobile Status Badge */}
                        <div className="md:hidden">
                           {getStatusLabel(grade.status)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Mã: {grade.course?.code || "N/A"}
                      </p>

                      {/* Scores Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Giữa kỳ</p>
                          <p className="text-base font-bold text-gray-800">
                            {grade.midtermScore !== undefined && grade.midtermScore !== null 
                              ? grade.midtermScore.toFixed(1) 
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Cuối kỳ</p>
                          <p className="text-base font-bold text-gray-800">
                            {grade.finalScore !== undefined && grade.finalScore !== null
                              ? grade.finalScore.toFixed(1) 
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Chuyên cần</p>
                          <p className="text-base font-bold text-gray-800">
                            {grade.attendance !== undefined ? `${grade.attendance}%` : "-"}
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-xs text-gray-400 mb-0.5">Trạng thái</p>
                          {getStatusLabel(grade.status)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Letter Grade Badge */}
                    <div className="flex-shrink-0 w-full md:w-auto flex justify-end md:block">
                       {grade.letterGrade ? (
                          <div className={`
                             w-16 h-16 rounded-xl flex items-center justify-center shadow-sm
                             ${getLetterGradeColor(grade.letterGrade)}
                          `}>
                             <span className="text-3xl font-bold tracking-tight">{grade.letterGrade}</span>
                          </div>
                       ) : (
                          <div className="h-16 flex items-center px-4 bg-gray-50 text-gray-400 rounded-xl text-sm font-medium border border-gray-100">
                             Chưa xếp loại
                          </div>
                       )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <BarChart3 size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Chưa có dữ liệu điểm số</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default GradesPage;