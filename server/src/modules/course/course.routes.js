const express = require("express");
const router = express.Router();
const courseController = require("./course.controller");
const {
  protect,
  authorize,
  optionalAuth,
} = require("../../shared/middleware/auth.middleware");

// Public routes (with optional auth)
router.get("/", optionalAuth, courseController.getAllCourses);
router.get("/:id", optionalAuth, courseController.getCourseById);

// Protected routes
router.use(protect);

// Create course (director, academic)
router.post(
  "/",
  authorize("director", "academic"),
  courseController.createCourse
);

// Update course (director, academic)
router.put(
  "/:id",
  authorize("director", "academic"),
  courseController.updateCourse
);

// Delete course (director only)
router.delete("/:id", authorize("director"), courseController.deleteCourse);

module.exports = router;
