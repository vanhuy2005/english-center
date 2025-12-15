import React, { useEffect, useState } from "react";
import { getMyCourses } from "../services/student";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching dashboard data...");

      const coursesData = await getMyCourses();
      console.log("📊 Raw courses data:", coursesData);
      console.log("📊 Type:", typeof coursesData);
      console.log("📊 Is Array:", Array.isArray(coursesData));

      // Ensure array - handle both array and object responses
      let coursesArray = [];
      if (Array.isArray(coursesData)) {
        coursesArray = coursesData;
      } else if (coursesData && typeof coursesData === "object") {
        // If it's an object but not an array, try to extract data
        coursesArray =
          coursesData.data || (coursesData.courses ? [coursesData] : []);
      }

      console.log("✅ Courses count:", coursesArray.length);
      setCourses(coursesArray);
    } catch (error) {
      console.error("❌ Dashboard error:", error);
      setError(error.message || "Không thể tải dữ liệu");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-bold mb-2">Lỗi</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📚 Bảng Điều Khiển Học Viên</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-blue-900 font-semibold">Khóa Học Đang Học</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {courses.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Danh Sách Khóa Học</h2>

        {courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="border rounded p-4 hover:shadow transition"
              >
                <h3 className="font-bold text-blue-600">
                  {course.course?.name || "Khóa học"}
                </h3>
                <p className="text-sm text-gray-600">
                  Mã: {course.course?.code || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Giáo viên: {course.teacher?.fullName || "N/A"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            📭 Bạn chưa đăng ký khóa học nào
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
