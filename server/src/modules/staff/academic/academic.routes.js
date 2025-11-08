const express = require("express");
const router = express.Router();
const academicController = require("./academic.controller");
const {
  protect,
  authorize,
} = require("../../../shared/middleware/auth.middleware");

// All routes require authentication and academic staff or director role
router.use(protect);
router.use(authorize(["academic", "director"]));

// ==================== DASHBOARD ====================
router.get("/dashboard", academicController.getDashboard);

// ==================== CLASS MANAGEMENT ====================
router.get("/classes", academicController.getClasses);

// ==================== ATTENDANCE TRACKING ====================
router.get("/attendance", academicController.getAttendanceData);
router.post("/attendance/report", academicController.exportAttendanceReport);

// ==================== GRADE MANAGEMENT ====================
router.get("/grades", academicController.getGrades);
router.put("/grades/:id", academicController.updateGrade);

// ==================== STUDENT PROGRESS ====================
router.get("/students/progress", academicController.getStudentProgress);

// ==================== REQUEST HANDLING ====================
router.get("/requests", academicController.getRequests);
router.put("/requests/:id/approve", academicController.approveRequest);
router.put("/requests/:id/reject", academicController.rejectRequest);

// ==================== REPORTS & STATISTICS ====================
router.get("/reports/class/:classId", academicController.getClassReport);
router.get("/statistics", academicController.getStatistics);

module.exports = router;
