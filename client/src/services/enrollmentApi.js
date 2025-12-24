import api from "./api";

// Lấy danh sách khóa học đã đăng ký từ server (KHÔNG dùng mock)
export const getMyEnrolledCourses = async () => {
  try {
    try {
      const response = await api.get("/students/me/courses");
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.debug(
        "/students/me/courses failed:",
        err?.response?.status || err.message
      );
    }

    console.warn(
      "Enrolled-courses endpoint unavailable — returning empty list"
    );
    return [];
  } catch (error) {
    console.error("Error getting enrolled courses:", error);
    return [];
  }
};

// Hủy đăng ký khóa học
export const unenrollCourse = async (enrollmentId) => {
  try {
    const response = await api.delete(`/student/enrollments/${enrollmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error unenrolling course:", error);
    return { success: false };
  }
};
