const express = require("express");
const router = express.Router();
const directorController = require("./director.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");

// All routes require director authentication
router.use(protect);
router.use(authorize("director"));

// User Management
router.post("/users", directorController.createUserAccount);
router.get("/users", directorController.getAllUsers);
router.delete("/users/:userId", directorController.deleteUser);

// Dashboard
router.get("/dashboard", directorController.getDashboard);

// Revenue Reports
router.get("/reports/charts/revenue", directorController.getRevenueChart);
router.get("/reports/revenue-stats", directorController.getRevenueStats);

// Student Reports
router.get("/reports/student-stats", directorController.getStudentStats);
router.get("/reports/enrollment-trend", directorController.getEnrollmentTrend);
router.get(
  "/reports/charts/student-distribution",
  directorController.getStudentDistribution
);
router.get("/reports/top-students", directorController.getTopStudents);

// Class Reports
router.get("/reports/class-stats", directorController.getClassStats);
router.get("/reports/classes-by-status", directorController.getClassesByStatus);
router.get("/reports/class-capacity", directorController.getClassCapacity);
router.get("/reports/all-classes", directorController.getAllClasses);

// Teacher Reports
router.get("/reports/teacher-stats", directorController.getTeacherStats);
router.get(
  "/reports/teacher-performance",
  directorController.getTeacherPerformance
);
router.get("/reports/top-teachers", directorController.getTopTeachers);
router.get(
  "/reports/teacher-rating-distribution",
  directorController.getTeacherRatingDistribution
);

// Retention Reports
router.get("/reports/retention-stats", directorController.getRetentionStats);
router.get("/reports/retention-trend", directorController.getRetentionTrend);
router.get("/reports/dropout-reasons", directorController.getDropoutReasons);
router.get("/reports/at-risk-students", directorController.getAtRiskStudents);
router.get(
  "/reports/retention-by-course",
  directorController.getRetentionByCourse
);

// Department Reports
router.get(
  "/reports/enrollment-department",
  directorController.getEnrollmentDepartment
);
router.get(
  "/reports/academic-department",
  directorController.getAcademicDepartment
);
router.get(
  "/reports/accounting-department",
  directorController.getAccountingDepartment
);
router.get(
  "/reports/department-performance",
  directorController.getDepartmentPerformance
);

// Other Reports
router.get("/reports/charts/attendance", directorController.getAttendanceChart);
router.get("/reports/activities", directorController.getRecentActivities);

module.exports = router;
