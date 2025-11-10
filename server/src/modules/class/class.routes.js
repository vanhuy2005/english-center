const express = require("express");
const router = express.Router();
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getClassSchedule,
  getClassStats,
} = require("./class.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");
const validateObjectId = require("../../shared/middleware/validateObjectId");

// Public routes (none for classes)

// Protected routes - all require authentication
router.use(protect);

// Get all classes & create new class
router
  .route("/")
  .get(getAllClasses)
  .post(authorize("director", "academic"), createClass);

// Get, update, delete specific class
router
  .route("/:id")
  .get(validateObjectId, getClassById)
  .put(validateObjectId, authorize("director", "academic"), updateClass)
  .delete(validateObjectId, authorize("director"), deleteClass);

// Student management in class
router
  .route("/:id/students/:studentId")
  .post(
    validateObjectId,
    authorize("director", "enrollment", "academic"),
    addStudentToClass
  )
  .delete(
    validateObjectId,
    authorize("director", "academic"),
    removeStudentFromClass
  );

// Class schedule
router.route("/:id/schedule").get(validateObjectId, getClassSchedule);

// Class statistics
router.route("/:id/stats").get(validateObjectId, getClassStats);

module.exports = router;
