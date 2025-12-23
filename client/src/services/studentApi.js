import api from "./api";

// Lấy danh sách khóa học của học viên
export const getMyCourses = async () => {
  try {
    // Thử endpoint 1
    try {
      const response = await api.get("/students/me/courses");
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err1) {
      console.log("Endpoint 1 failed:", err1.response?.status);
    }

    // Thử endpoint 2
    try {
      const response = await api.get("/student/my-enrollments");
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err2) {
      console.log("Endpoint 2 failed:", err2.response?.status);
    }

    // Trả về empty array nếu cả hai đều fail
    return [];
  } catch (error) {
    console.error("Error getting my courses:", error);
    return [];
  }
};

// Đăng ký khóa học
export const enrollCourse = async (courseId, studentId) => {
  try {
    const response = await api.post("/student/course-enrollments", {
      courseId,
      studentId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách khóa học khả dụng
export const getAvailableCourses = async () => {
  try {
    const response = await api.get("/courses");
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error getting available courses:", error);
    return [];
  }
};
