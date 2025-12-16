const express = require("express");
const router = express.Router();
const academicController = require("./academic.controller");
const {
  protect,
  authorize,
} = require("../../../shared/middleware/auth.middleware");

// All routes require authentication
router.use(protect);

// Dashboard
router.get("/dashboard", academicController.getDashboard);

// Attendance Management
router.get("/attendance", academicController.getAttendance);
router.get("/attendance/:classId", academicController.getAttendanceByClass);
router.post("/attendance", academicController.createAttendance);
router.put("/attendance/:id", academicController.updateAttendance);

// Grade Management
router.get("/grades", academicController.getGrades);
router.get("/grades/:classId", academicController.getGradesByClass);
router.put("/grades/:id", academicController.updateGrade);
router.post("/grades/:id/publish", academicController.publishGrade);

// Student Management
router.get("/students", academicController.getStudents);
router.get("/students/:id", academicController.getStudentDetail);

// Reports
router.get("/reports/class/:classId", academicController.getClassReport);

module.exports = router;
