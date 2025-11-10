import apiClient from "./api";

// Auth Services
export const authService = {
  login: (credentials) => apiClient.post("/api/auth/login", credentials),
  register: (userData) => apiClient.post("/api/auth/register", userData),
  logout: () => apiClient.post("/api/auth/logout"),
  refreshToken: () => apiClient.post("/api/auth/refresh"),
  forgotPassword: (email) =>
    apiClient.post("/api/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    apiClient.post("/api/auth/reset-password", { token, password }),
  changePassword: (currentPassword, newPassword, isFirstLogin = false) =>
    apiClient.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
      isFirstLogin,
    }),
};

// User Services
export const userService = {
  getProfile: () => apiClient.get("/api/users/profile"),
  updateProfile: (data) => apiClient.put("/api/users/profile", data),
  uploadAvatar: (formData) =>
    apiClient.post("/api/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Student Services
export const studentService = {
  getAll: (params) => apiClient.get("/api/students", { params }),
  getById: (id) => apiClient.get(`/api/students/${id}`),
  create: (data) => apiClient.post("/api/students", data),
  update: (id, data) => apiClient.put(`/api/students/${id}`, data),
  delete: (id) => apiClient.delete(`/api/students/${id}`),
  getEnrolledCourses: (id) => apiClient.get(`/api/students/${id}/courses`),
  getSchedule: (id) => apiClient.get(`/api/students/${id}/schedule`),
  getAttendance: (id, params) =>
    apiClient.get(`/api/students/${id}/attendance`, { params }),
  getGrades: (id) => apiClient.get(`/api/students/${id}/grades`),
  getFinancialRecords: (id) => apiClient.get(`/api/students/${id}/finance`),

  // Student self-service APIs
  getMyCourses: () => apiClient.get("/api/students/me/courses"),
  getMyGrades: () => apiClient.get("/api/students/me/grades"),
  getMyAttendance: () => apiClient.get("/api/students/me/attendance"),
  getMyTuition: () => apiClient.get("/api/students/me/tuition"),
  getMyRequests: () => apiClient.get("/api/students/me/requests"),
  createRequest: (data) => apiClient.post("/api/students/me/requests", data),
};

// Grade Services
export const gradeService = {
  getMyGrades: () => apiClient.get("/api/grades/me"),
  getById: (id) => apiClient.get(`/api/grades/${id}`),
  create: (data) => apiClient.post("/api/grades", data),
  update: (id, data) => apiClient.put(`/api/grades/${id}`, data),
  delete: (id) => apiClient.delete(`/api/grades/${id}`),
};

// Teacher Services
export const teacherService = {
  getAll: (params) => apiClient.get("/api/teachers", { params }),
  getById: (id) => apiClient.get(`/api/teachers/${id}`),
  create: (data) => apiClient.post("/api/teachers", data),
  update: (id, data) => apiClient.put(`/api/teachers/${id}`, data),
  delete: (id) => apiClient.delete(`/api/teachers/${id}`),
  getClasses: (id) => apiClient.get(`/api/teachers/${id}/classes`),
  getStudents: (id, classId) =>
    apiClient.get(`/api/teachers/${id}/classes/${classId}/students`),
};

// Course Services
export const courseService = {
  getAll: (params) => apiClient.get("/api/courses", { params }),
  getById: (id) => apiClient.get(`/api/courses/${id}`),
  create: (data) => apiClient.post("/api/courses", data),
  update: (id, data) => apiClient.put(`/api/courses/${id}`, data),
  delete: (id) => apiClient.delete(`/api/courses/${id}`),
  getClasses: (id) => apiClient.get(`/api/courses/${id}/classes`),
};

// Class Services
export const classService = {
  getAll: (params) => apiClient.get("/api/classes", { params }),
  getById: (id) => apiClient.get(`/api/classes/${id}`),
  create: (data) => apiClient.post("/api/classes", data),
  update: (id, data) => apiClient.put(`/api/classes/${id}`, data),
  delete: (id) => apiClient.delete(`/api/classes/${id}`),
  getStudents: (id) => apiClient.get(`/api/classes/${id}/students`),
  addStudent: (id, studentId) =>
    apiClient.post(`/api/classes/${id}/students`, { studentId }),
  removeStudent: (id, studentId) =>
    apiClient.delete(`/api/classes/${id}/students/${studentId}`),
};

// Attendance Services
export const attendanceService = {
  getAll: (params) => apiClient.get("/api/attendance", { params }),
  getByClass: (classId, date) =>
    apiClient.get(`/api/attendance/class/${classId}`, { params: { date } }),
  mark: (data) => apiClient.post("/api/attendance", data),
  update: (id, data) => apiClient.put(`/api/attendance/${id}`, data),
  getStatistics: (params) =>
    apiClient.get("/api/attendance/statistics", { params }),
};

// Finance Services
export const financeService = {
  getAll: (params) => apiClient.get("/api/finance", { params }),
  getMyPayments: () => apiClient.get("/api/finance/me/payments"),
  getById: (id) => apiClient.get(`/api/finance/${id}`),
  create: (data) => apiClient.post("/api/finance", data),
  update: (id, data) => apiClient.put(`/api/finance/${id}`, data),
  delete: (id) => apiClient.delete(`/api/finance/${id}`),
  getByStudent: (studentId) =>
    apiClient.get(`/api/finance/student/${studentId}`),
  createPayment: (data) => apiClient.post("/api/finance/payment", data),
  createRefund: (data) => apiClient.post("/api/finance/refund", data),
  getStatistics: (params) =>
    apiClient.get("/api/finance/statistics", { params }),
  getRevenue: (params) => apiClient.get("/api/finance/revenue", { params }),
  getOverview: () => apiClient.get("/api/finance/overview"),
};

// Request Services (Leave, Makeup, Transfer, Pause)
export const requestService = {
  getAll: (params) => apiClient.get("/api/requests", { params }),
  getById: (id) => apiClient.get(`/api/requests/${id}`),
  create: (data) => apiClient.post("/api/requests", data),
  update: (id, data) => apiClient.put(`/api/requests/${id}`, data),
  delete: (id) => apiClient.delete(`/api/requests/${id}`),
  approve: (id, data) => apiClient.post(`/api/requests/${id}/approve`, data),
  reject: (id, data) => apiClient.post(`/api/requests/${id}/reject`, data),
  getByStudent: (studentId) =>
    apiClient.get(`/api/requests/student/${studentId}`),
};

// Notification Services
export const notificationService = {
  getAll: (params) => apiClient.get("/api/notifications", { params }),
  getMyNotifications: () => apiClient.get("/api/notifications/me"),
  getById: (id) => apiClient.get(`/api/notifications/${id}`),
  create: (data) => apiClient.post("/api/notifications", data),
  markAsRead: (id) => apiClient.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put("/api/notifications/read-all"),
  delete: (id) => apiClient.delete(`/api/notifications/${id}`),
  getUnreadCount: () => apiClient.get("/api/notifications/unread-count"),
};

// Report Services (Director)
export const reportService = {
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
    apiClient.get("/api/director/reports/academic-department"),
  getAccountingDepartment: () =>
    apiClient.get("/api/director/reports/accounting-department"),
  getDepartmentPerformance: (params) =>
    apiClient.get("/api/director/reports/department-performance", { params }),
};

// Schedule Services
export const scheduleService = {
  getAll: (params) => apiClient.get("/api/schedules", { params }),
  getMySchedules: (params) => apiClient.get("/api/schedules/me", { params }),
  getById: (id) => apiClient.get(`/api/schedules/${id}`),
  create: (data) => apiClient.post("/api/schedules", data),
  update: (id, data) => apiClient.put(`/api/schedules/${id}`, data),
  delete: (id) => apiClient.delete(`/api/schedules/${id}`),
  getByClass: (classId) => apiClient.get(`/api/schedules/class/${classId}`),
  getByTeacher: (teacherId, date) =>
    apiClient.get(`/api/schedules/teacher/${teacherId}`, { params: { date } }),
  getByStudent: (studentId, date) =>
    apiClient.get(`/api/schedules/student/${studentId}`, { params: { date } }),
};

// Staff Services
export const staffService = {
  getAll: (params) => apiClient.get("/api/staff", { params }),
  getById: (id) => apiClient.get(`/api/staff/${id}`),
  create: (data) => apiClient.post("/api/staff", data),
  update: (id, data) => apiClient.put(`/api/staff/${id}`, data),
  delete: (id) => apiClient.delete(`/api/staff/${id}`),
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
