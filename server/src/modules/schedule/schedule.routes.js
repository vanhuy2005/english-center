const express = require("express");
const router = express.Router();
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getTeacherSchedule,
  getClassSchedule,
  createRecurringSchedules,
} = require("./schedule.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");
const validateObjectId = require("../../shared/middleware/validateObjectId");

// All routes require authentication
router.use(protect);

// Get all schedules & create new schedule
router
  .route("/")
  .get(getAllSchedules)
  .post(authorize("director", "academic"), createSchedule);

// Create recurring schedules
router
  .route("/recurring")
  .post(authorize("director", "academic"), createRecurringSchedules);

// Get teacher's schedule
router.route("/teacher/:teacherId").get(validateObjectId, getTeacherSchedule);

// Get class schedule
router.route("/class/:classId").get(validateObjectId, getClassSchedule);

// Get, update, delete specific schedule
router
  .route("/:id")
  .get(validateObjectId, getScheduleById)
  .put(validateObjectId, authorize("director", "academic"), updateSchedule)
  .delete(validateObjectId, authorize("director", "academic"), deleteSchedule);

module.exports = router;
