const express = require("express");
const router = express.Router();
const {
  getAllAttendance,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendance,
  getClassAttendance,
  getScheduleAttendance,
} = require("./attendance.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");
const validateObjectId = require("../../shared/middleware/validateObjectId");

// All routes require authentication
router.use(protect);

// Get all attendance records
router.route("/").get(getAllAttendance);

// Mark attendance for a session
router
  .route("/mark")
  .post(authorize("director", "academic", "teacher"), markAttendance);

// Get student attendance report
router.route("/student/:studentId").get(validateObjectId, getStudentAttendance);

// Get class attendance report
router.route("/class/:classId").get(validateObjectId, getClassAttendance);

// Get attendance for specific schedule
router
  .route("/schedule/:scheduleId")
  .get(validateObjectId, getScheduleAttendance);

// Get, update, delete specific attendance record
router
  .route("/:id")
  .get(validateObjectId, getAttendanceById)
  .put(
    validateObjectId,
    authorize("director", "academic", "teacher"),
    updateAttendance
  )
  .delete(
    validateObjectId,
    authorize("director", "academic"),
    deleteAttendance
  );

module.exports = router;
