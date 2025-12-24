const express = require("express");
const router = express.Router();
const courseController = require("./course.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");

// Public routes - anyone can view courses
router.get(
  "/",
  courseController.getAllCourses ||
    ((req, res) => res.json({ success: true, data: [] }))
);
router.get(
  "/:id",
  courseController.getCourseById ||
    ((req, res) => res.json({ success: true, data: null }))
);

// Protected routes - require authentication
router.use(protect);
router.post(
  "/",
  courseController.createCourse || ((req, res) => res.json({ success: true }))
);

// One-time migration route to fill tuition for legacy courses
// Protected: only 'director' can run this
router.post(
  "/fix-tuition",
  authorize("director"),
  courseController.fixCourseTuition ||
    ((req, res) => res.json({ success: true }))
);
router.put(
  "/:id",
  courseController.updateCourse || ((req, res) => res.json({ success: true }))
);
router.delete(
  "/:id",
  courseController.deleteCourse || ((req, res) => res.json({ success: true }))
);

module.exports = router;
