import api from "./api";

export const studentAPI = {
  // Get my courses
  getMyCourses: () => {
    console.log("📚 Fetching my courses...");
    return api.get("/students/me/courses");
  },

  // Get my profile
  getMyProfile: () => api.get("/students/me"),

  // Get my grades
  getMyGrades: () => api.get("/students/me/grades"),

  // Get my attendance
  getMyAttendance: () => api.get("/students/me/attendance"),

  // Get all students (admin only)
  getAllStudents: (params) => api.get("/students", { params }),

  // Get student by ID
  getStudentById: (id) => api.get(`/students/${id}`),

  // Update student
  updateStudent: (id, data) => api.put(`/students/${id}`, data),

  // Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/students/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
