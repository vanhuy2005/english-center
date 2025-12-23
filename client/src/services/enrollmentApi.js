import api from "./api";

// Mock data
const getMockEnrolledCourses = () => [
  {
    _id: "enrollment_1",
    course: {
      _id: "course1",
      name: "English A1",
      code: "EN-A1",
      description: "Khóa học tiếng Anh sơ cấp",
      level: "beginner",
      tuition: 3500000,
      duration: { hours: 60, weeks: 12 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    status: "active",
    enrollmentDate: new Date(),
    paymentStatus: "pending",
    progress: 45,
  },
  {
    _id: "enrollment_2",
    course: {
      _id: "course2",
      name: "English A2",
      code: "EN-A2",
      description: "Khóa học tiếng Anh sơ cấp nâng cao",
      level: "beginner",
      tuition: 3500000,
      duration: { hours: 60, weeks: 12 },
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 97 * 24 * 60 * 60 * 1000),
    },
    status: "pending",
    enrollmentDate: new Date(),
    paymentStatus: "pending",
    progress: 0,
  },
];

// Lấy danh sách khóa học đã đăng ký
export const getMyEnrolledCourses = async () => {
  try {
    // Use canonical student self-service endpoint. If it fails, fallback to mock data.
    try {
      const response = await api.get("/students/me/courses");
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      // Avoid noisy logs; fallback to mock data
      console.debug(
        "/students/me/courses failed:",
        err?.response?.status || err.message
      );
    }

    return getMockEnrolledCourses();
  } catch (error) {
    console.error("Error getting enrolled courses:", error);
    return getMockEnrolledCourses();
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
