import React, { useState, useEffect } from "react";
import { studentService } from "../../services";
import { Loading } from "../../components/common"; // Giả sử Loading ở đây
// import Badge from "../../components/common/Badge"; // Tạm thời comment Badge cũ để custom lại theo theme
import {
  GraduationCap,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Filter,
  CheckCircle,
  FileText,
  Award,
} from "lucide-react";

const StudentGradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    fetchMyGrades();
  }, []);

  // --- LOGIC GIỮ NGUYÊN (KHÔNG THAY ĐỔI) ---
  const fetchMyGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getMyGrades();

      console.log("📊 Student getMyGrades response:", response);

      let payload = [];
      if (!response) payload = [];
      else if (Array.isArray(response)) payload = response;
      else if (response.data) {
        if (Array.isArray(response.data)) payload = response.data;
        else if (response.data.data && Array.isArray(response.data.data))
          payload = response.data.data;
        else payload = [];
      } else payload = [];

      console.log("📊 Parsed payload:", payload);

      const normalized = (payload || []).map((g) => {
        const courseName =
          g.course?.name ||
          g.courseName ||
          (g.course && g.course.courseName) ||
          "";
        const className =
          g.class?.name || g.className || (g.class && g.class.className) || "";

        const participation =
          g.scores?.participation ?? g.participation ?? null;
        const assignment = g.scores?.homework ?? g.assignment ?? null;
        const midterm = g.scores?.midterm ?? g.midterm ?? null;
        const finalExam = g.scores?.final ?? g.final ?? null;

        const finalGrade =
          g.totalScore !== undefined && g.totalScore !== null
            ? g.totalScore
            : g.finalGrade !== undefined
            ? g.finalGrade
            : null;

        return {
          ...g,
          courseName,
          className,
          participation,
          assignment,
          midterm,
          finalExam,
          finalGrade,
        };
      });

      console.log("📊 Normalized grades:", normalized);

      setGrades(normalized);
    } catch (err) {
      console.error("Error fetching grades:", err);
      setError(err.response?.data?.message || "Không thể tải kết quả học tập");
    } finally {
      setLoading(false);
    }
  };

  // Helper styles updated to match Theme Variables
  const getGradeColor = (grade) => {
    if (grade >= 8.5) return "text-[var(--color-secondary)]"; // Teal/Green
    if (grade >= 7) return "text-[#1d5a87]"; // Accent Light Blue
    if (grade >= 5.5) return "text-amber-600"; // Yellow/Amber
    return "text-[var(--color-danger)]"; // Red
  };

  const getGradeLabel = (grade) => {
    if (grade >= 8.5) return "Xuất sắc";
    if (grade >= 7) return "Giỏi";
    if (grade >= 5.5) return "Khá";
    if (grade >= 4) return "Trung bình";
    return "Yếu";
  };

  const getBadgeStyle = (grade) => {
    if (grade >= 8.5)
      return "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]";
    if (grade >= 7) return "bg-blue-50 text-blue-700";
    if (grade >= 5.5) return "bg-amber-50 text-amber-700";
    return "bg-red-50 text-[var(--color-danger)]";
  };

  const courses = ["all", ...new Set(grades.map((g) => g.courseName))];
  const filteredGrades =
    selectedCourse === "all"
      ? grades
      : grades.filter((g) => g.courseName === selectedCourse);

  const totalGrades = filteredGrades.filter((g) => g.finalGrade !== null);
  const averageGrade =
    totalGrades.length > 0
      ? (
          totalGrades.reduce((sum, g) => sum + g.finalGrade, 0) /
          totalGrades.length
        ).toFixed(2)
      : "N/A";

  // --- UI RENDER ---

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-6 md:p-8">
      <div className="w-full mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
              <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                <GraduationCap size={20} className="text-white" />
              </div>
              Kết Quả Học Tập
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Theo dõi tiến độ và thành tích học tập
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-[var(--color-danger)]" size={20} />
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {/* Summary Cards (Polished UI) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Avg Grade */}
          <div className="bg-white rounded-xl p-5 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Điểm trung bình
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-primary)]">
                {averageGrade}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>

          {/* Graded Subjects */}
          <div className="bg-white rounded-xl p-5 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Môn đã có điểm
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-secondary)]">
                {totalGrades.length}
              </h3>
            </div>
            <div className="p-2.5 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-lg">
              <CheckCircle size={20} />
            </div>
          </div>

          {/* Pending Subjects */}
          <div className="bg-white rounded-xl p-5 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Chưa có điểm
              </p>
              <h3 className="text-3xl font-bold text-amber-500">
                {grades.length - totalGrades.length}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <FileText size={20} />
            </div>
          </div>

          {/* Rank */}
          <div className="bg-white rounded-xl p-5 shadow-[var(--shadow-card)] border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Xếp loại chung
              </p>
              <h3 className="text-xl font-bold text-purple-600 mt-1.5">
                {averageGrade !== "N/A"
                  ? getGradeLabel(parseFloat(averageGrade))
                  : "---"}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <Award size={20} />
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full text-gray-500">
              <Filter size={16} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Lọc theo khóa học
              </label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full md:w-1/3 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] block p-2.5 outline-none transition-all"
                >
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course === "all" ? "Tất cả khóa học" : course}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-xl shadow-[var(--shadow-card)] border border-gray-100 overflow-hidden">
          {filteredGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-50 rounded-full mb-3">
                <FileText size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">
                Chưa có kết quả học tập
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                      Khóa học / Lớp
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Tham gia (10%)
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Bài tập (20%)
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Giữa kỳ (30%)
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Cuối kỳ (40%)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                      Điểm TB
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Xếp loại
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredGrades.map((grade, index) => {
                    const hasScores =
                      grade.midterm !== null || grade.finalExam !== null;
                    const isApproved = grade.isPublished && hasScores;
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50/50 transition-colors ${
                          isApproved
                            ? "bg-green-50/30 hover:bg-green-50/50"
                            : "bg-gray-50/20"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-[var(--color-primary)]">
                              {grade.courseName || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 font-medium">
                              {grade.className || "---"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded">
                            {grade.participation ?? "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded">
                            {grade.assignment ?? "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded">
                            {grade.midterm ?? "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded">
                            {grade.finalExam ?? "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {grade.finalGrade !== null ? (
                            <span
                              className={`text-base font-bold ${getGradeColor(
                                grade.finalGrade
                              )}`}
                            >
                              {grade.finalGrade.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Chưa có
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {grade.finalGrade !== null ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getBadgeStyle(
                                grade.finalGrade
                              )}`}
                            >
                              {getGradeLabel(grade.finalGrade)}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentGradesPage;
