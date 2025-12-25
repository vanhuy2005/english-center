import apiClient from "./api";

// Auth Services
export const authService = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  logout: () => apiClient.post("/auth/logout"),
  refreshToken: () => apiClient.post("/auth/refresh"),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    apiClient.post("/auth/reset-password", { token, password }),
  changePassword: (currentPassword, newPassword, isFirstLogin = false) =>
    apiClient.put("/auth/change-password", {
      currentPassword,
      newPassword,
      isFirstLogin,
    }),
};

// User Services
export const userService = {
  getProfile: () => apiClient.get("/auth/me"),
  updateProfile: (data) => apiClient.put("/auth/me", data),
  uploadAvatar: (formData) =>
    apiClient.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Student Services
export const studentService = {
  getAll: (params) => apiClient.get("/students", { params }),
  getById: (id) => apiClient.get(`/students/${id}`),
  create: (data) => apiClient.post("/students", data),
  update: (id, data) => apiClient.put(`/students/${id}`, data),
  delete: (id) => apiClient.delete(`/students/${id}`),
  getEnrolledCourses: (id) => apiClient.get(`/students/${id}/courses`),
  getSchedule: (id) => apiClient.get(`/students/${id}/schedule`),
  getAttendance: (id, params) =>
    apiClient.get(`/students/${id}/attendance`, { params }),
  getGrades: (id) => apiClient.get(`/students/${id}/grades`),
  getFinancialRecords: (id) => apiClient.get(`/students/${id}/finance`),

  // Student self-service APIs
  getMyCourses: () =>
    apiClient.get("/students/me/courses").catch((error) => {
      console.error("Error getting my courses:", error);
      throw error;
    }),
  getMyGrades: () => apiClient.get("/students/me/grades"),
  getMyAttendance: () => apiClient.get("/students/me/attendance"),
  getMyTuition: () => apiClient.get("/students/me/tuition"),
  getMyRequests: () => apiClient.get("/students/me/requests"),
  createRequest: (data) => apiClient.post("/students/me/requests", data),
};

// Grade Services
export const gradeService = {
  getMyGrades: () => apiClient.get("/grades/me"),
  getById: (id) => apiClient.get(`/grades/${id}`),
  create: (data) => apiClient.post("/grades", data),
  update: (id, data) => apiClient.put(`/grades/${id}`, data),
  delete: (id) => apiClient.delete(`/grades/${id}`),
};

// Teacher Services
export const teacherService = {
  getAll: (params) => apiClient.get("/teachers", { params }),
  getById: (id) => apiClient.get(`/teachers/${id}`),
  create: (data) => apiClient.post("/teachers", data),
  update: (id, data) => apiClient.put(`/teachers/${id}`, data),
  delete: (id) => apiClient.delete(`/teachers/${id}`),
  getClasses: (id) => apiClient.get(`/teachers/${id}/classes`),
  getStudents: (id, classId) =>
    apiClient.get(`/teachers/${id}/classes/${classId}/students`),
};

// Course Services
export const courseService = {
  getAll: (params) => apiClient.get("/courses", { params }),
  getById: (id) => apiClient.get(`/courses/${id}`),
  create: (data) => apiClient.post("/courses", data),
  update: (id, data) => apiClient.put(`/courses/${id}`, data),
  delete: (id) => apiClient.delete(`/courses/${id}`),
  getClasses: (id) => apiClient.get(`/courses/${id}/classes`),
};

// Class Services
export const classService = {
  getAll: (params) => apiClient.get("/classes", { params }),
  getById: (id) => apiClient.get(`/classes/${id}`),
  create: (data) => apiClient.post("/classes", data),
  update: (id, data) => apiClient.put(`/classes/${id}`, data),
  delete: (id) => apiClient.delete(`/classes/${id}`),
  getStudents: (id) => apiClient.get(`/classes/${id}/students`),
  addStudent: (id, studentId) =>
    apiClient.post(`/classes/${id}/students`, { studentId }),
  removeStudent: (id, studentId) =>
    apiClient.delete(`/classes/${id}/students/${studentId}`),
};

// Attendance Services
export const attendanceService = {
  getAll: (params) => apiClient.get("/attendance", { params }),
  getByClass: (classId, date) =>
    apiClient.get(`/attendance/class/${classId}`, { params: { date } }),
  mark: (data) => apiClient.post("/attendance", data),
  update: (id, data) => apiClient.put(`/attendance/${id}`, data),
  getStatistics: (params) =>
    apiClient.get("/attendance/statistics", { params }),
};

// Finance Services
export const financeService = {
  getAll: (params) => apiClient.get("/finance", { params }),
  getMyPayments: () => apiClient.get("/finance/me/payments"),
  getById: (id) => apiClient.get(`/finance/${id}`),
  create: (data) => apiClient.post("/finance", data),
  update: (id, data) => apiClient.put(`/finance/${id}`, data),
  delete: (id) => apiClient.delete(`/finance/${id}`),
  getByStudent: (studentId) => apiClient.get(`/finance/student/${studentId}`),
  createPayment: (data) => apiClient.post("/finance/payment", data),
  createRefund: (data) => apiClient.post("/finance/refund", data),
  getStatistics: (params) => apiClient.get("/finance/statistics", { params }),
  getRevenue: (params) => apiClient.get("/finance/revenue", { params }),
  getOverview: () => apiClient.get("/finance/overview"),
};

// Request Services (Leave, Makeup, Transfer, Pause)
export const requestService = {
  getAll: (params) => apiClient.get("/requests", { params }),
  getById: (id) => apiClient.get(`/requests/${id}`),
  create: (data) => apiClient.post("/requests", data),
  update: (id, data) => apiClient.put(`/requests/${id}`, data),
  delete: (id) => apiClient.delete(`/requests/${id}`),
  approve: (id, data) => apiClient.post(`/requests/${id}/approve`, data),
  reject: (id, data) => apiClient.post(`/requests/${id}/reject`, data),
  getByStudent: (studentId) => apiClient.get(`/requests/student/${studentId}`),
};

// Notification Services
export const notificationService = {
  getAll: (params) => apiClient.get("/notifications", { params }),
  getMyNotifications: () => apiClient.get("/notifications"),
  getById: (id) => apiClient.get(`/notifications/${id}`),
  create: (data) => apiClient.post("/notifications", data),
  markAsRead: (notificationIds) =>
    apiClient.patch("/notifications/mark-read", { notificationIds }),
  markAllAsRead: () =>
    apiClient.patch("/notifications/mark-read", { notificationIds: "all" }),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
};

// Report Services (Director)
export const reportService = {
  // Prefix all report endpoints with /api to hit the Express routes
  getAll: (params) => apiClient.get("/api/director/reports", { params }),
  getById: (id) => apiClient.get(`/api/director/reports/${id}`),
  create: (data) => apiClient.post("/api/director/reports", data),
  delete: (id) => apiClient.delete(`/api/director/reports/${id}`),
  getAcademicReport: (params) =>
    apiClient.get("/api/director/reports/academic", { params }),
  getFinancialReport: (params) =>
    apiClient.get("/api/director/reports/financial", { params }),
  getAttendanceReport: (params) =>
    apiClient.get("/api/director/reports/attendance", { params }),
  getPerformanceReport: (params) =>
    apiClient.get("/api/director/reports/performance", { params }),

  // Dashboard specific
  getRevenueChart: (params) =>
    apiClient.get("/api/director/reports/charts/revenue", { params }),
  getAttendanceChart: (params) =>
    apiClient.get("/api/director/reports/charts/attendance", { params }),
  getStudentDistribution: () =>
    apiClient.get("/api/director/reports/charts/student-distribution"),
  getRecentActivities: (params) =>
    apiClient.get("/api/director/reports/activities", { params }),

  // Revenue Reports
  getRevenueStats: (params) =>
    apiClient.get("/api/director/reports/revenue-stats", { params }),

  // Student Reports
  getStudentStats: () => apiClient.get("/api/director/reports/student-stats"),
  getEnrollmentTrend: (params) =>
    apiClient.get("/api/director/reports/enrollment-trend", { params }),
  getTopStudents: (params) =>
    apiClient.get("/api/director/reports/top-students", { params }),

  // Class Reports
  getClassStats: () => apiClient.get("/api/director/reports/class-stats"),
  getClassesByStatus: () =>
    apiClient.get("/api/director/reports/classes-by-status"),
  getClassCapacity: () => apiClient.get("/api/director/reports/class-capacity"),
  getAllClasses: (params) =>
    apiClient.get("/api/director/reports/all-classes", { params }),

  // Teacher Reports
  getTeacherStats: () => apiClient.get("/api/director/reports/teacher-stats"),
  getTeacherPerformance: (params) =>
    apiClient.get("/api/director/reports/teacher-performance", { params }),
  getTopTeachers: (params) =>
    apiClient.get("/api/director/reports/top-teachers", { params }),
  getTeacherRatingDistribution: () =>
    apiClient.get("/api/director/reports/teacher-rating-distribution"),

  // Retention Reports
  getRetentionStats: () =>
    apiClient.get("/api/director/reports/retention-stats"),
  getRetentionTrend: (params) =>
    apiClient.get("/api/director/reports/retention-trend", { params }),
  getDropoutReasons: () =>
    apiClient.get("/api/director/reports/dropout-reasons"),
  getAtRiskStudents: (params) =>
    apiClient.get("/api/director/reports/at-risk-students", { params }),
  getRetentionByCourse: () =>
    apiClient.get("/api/director/reports/retention-by-course"),

  // Department Reports
  getEnrollmentDepartment: () =>
    apiClient.get("/api/director/reports/enrollment-department"),
  getAcademicDepartment: () =>
    apiClient.get("/director/reports/academic-department"),
  getAccountingDepartment: () =>
    apiClient.get("/director/reports/accounting-department"),
  getDepartmentPerformance: (params) =>
    apiClient.get("/director/reports/department-performance", { params }),
};

// Schedule Services
export const scheduleService = {
  getAll: (params) => apiClient.get("/schedules", { params }),
  getMySchedules: (params) => apiClient.get("/schedules/me", { params }),
  getById: (id) => apiClient.get(`/schedules/${id}`),
  create: (data) => apiClient.post("/schedules", data),
  update: (id, data) => apiClient.put(`/schedules/${id}`, data),
  delete: (id) => apiClient.delete(`/schedules/${id}`),
  getByClass: (classId) => apiClient.get(`/schedules/class/${classId}`),
  getByTeacher: (teacherId, date) =>
    apiClient.get(`/schedules/teacher/${teacherId}`, { params: { date } }),
  getByStudent: (studentId, date) =>
    apiClient.get(`/schedules/student/${studentId}`, { params: { date } }),
};

// Staff Services
export const staffService = {
  getAll: (params) => apiClient.get("/staff", { params }),
  getById: (id) => apiClient.get(`/staff/${id}`),
  create: (data) => apiClient.post("/staff", data),
  update: (id, data) => apiClient.put(`/staff/${id}`, data),
  delete: (id) => apiClient.delete(`/staff/${id}`),
};

export default {
  auth: authService,
  user: userService,
  student: studentService,
  teacher: teacherService,
  course: courseService,
  class: classService,
  attendance: attendanceService,
  finance: financeService,
  request: requestService,
  notification: notificationService,
  report: reportService,
  schedule: scheduleService,
  staff: staffService,
};
