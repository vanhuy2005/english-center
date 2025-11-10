import React, { useState, useEffect } from "react";
import { studentService } from "../../services";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";

const StudentGradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    fetchMyGrades();
  }, []);

  const fetchMyGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getMyGrades();
      setGrades(response.data || []);
    } catch (err) {
      console.error("Error fetching grades:", err);
      setError(err.response?.data?.message || "Không thể tải kết quả học tập");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 8.5) return "text-green-600";
    if (grade >= 7) return "text-blue-600";
    if (grade >= 5.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeLabel = (grade) => {
    if (grade >= 8.5) return "Xuất sắc";
    if (grade >= 7) return "Giỏi";
    if (grade >= 5.5) return "Khá";
    if (grade >= 4) return "Trung bình";
    return "Yếu";
  };

  const courses = ["all", ...new Set(grades.map((g) => g.courseName))];
  const filteredGrades =
    selectedCourse === "all"
      ? grades
      : grades.filter((g) => g.courseName === selectedCourse);

  // Calculate overall statistics
  const totalGrades = filteredGrades.filter((g) => g.finalGrade !== null);
  const averageGrade =
    totalGrades.length > 0
      ? (
          totalGrades.reduce((sum, g) => sum + g.finalGrade, 0) /
          totalGrades.length
        ).toFixed(2)
      : "N/A";

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Kết quả học tập
        </h1>
        <p className="text-gray-600">Xem điểm số và kết quả học tập của bạn</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {averageGrade}
            </div>
            <div className="text-sm text-gray-500 mt-1">Điểm trung bình</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {totalGrades.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Môn đã có điểm</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {grades.length - totalGrades.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Môn chưa có điểm</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {averageGrade !== "N/A"
                ? getGradeLabel(parseFloat(averageGrade))
                : "N/A"}
            </div>
            <div className="text-sm text-gray-500 mt-1">Xếp loại</div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Lọc theo khóa học:
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courses.map((course) => (
              <option key={course} value={course}>
                {course === "all" ? "Tất cả khóa học" : course}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Grades Table */}
      {filteredGrades.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600">Chưa có kết quả học tập</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Khóa học
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Tham gia (10%)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Bài tập (20%)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Giữa kỳ (30%)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Cuối kỳ (40%)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Điểm TB
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Xếp loại
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGrades.map((grade, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800">
                          {grade.courseName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.className}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">
                        {grade.participation ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">
                        {grade.assignment ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">
                        {grade.midterm ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">
                        {grade.finalExam ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {grade.finalGrade !== null ? (
                        <span
                          className={`text-lg font-bold ${getGradeColor(
                            grade.finalGrade
                          )}`}
                        >
                          {grade.finalGrade.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {grade.finalGrade !== null ? (
                        <Badge
                          color={
                            grade.finalGrade >= 8.5
                              ? "success"
                              : grade.finalGrade >= 7
                              ? "info"
                              : grade.finalGrade >= 5.5
                              ? "warning"
                              : "danger"
                          }
                        >
                          {getGradeLabel(grade.finalGrade)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentGradesPage;
