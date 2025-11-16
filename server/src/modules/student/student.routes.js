const express = require("express");
const router = express.Router();
const studentController = require("./student.controller");
const {
  protect,
  authorize,
} = require("../../shared/middleware/auth.middleware");

// All routes require authentication
router.use(protect);

// ===== STUDENT SELF-SERVICE ROUTES (MUST BE BEFORE /:id ROUTES) =====
// Get my courses (current student only)
router.get("/me/courses", authorize("student"), studentController.getMyCourses);

// Get my grades (current student only)
router.get("/me/grades", authorize("student"), studentController.getMyGrades);

// Get my attendance (current student only)
router.get(
  "/me/attendance",
  authorize("student"),
  studentController.getMyAttendance
);

// Get my tuition info (current student only)
router.get("/me/tuition", authorize("student"), studentController.getMyTuition);

// Get my requests (current student only)
router.get(
  "/me/requests",
  authorize("student"),
  studentController.getMyRequests
);

// Create new request (current student only)
router.post(
  "/me/requests",
  authorize("student"),
  studentController.createRequest
);

// Upload avatar (current student only)
const multer = require("multer");
const upload = multer({ dest: "uploads/avatars/" });
router.post(
  "/me/avatar",
  authorize("student"),
  upload.single("avatar"),
  studentController.uploadAvatar
);

// Get all students (director, staff)
router.get(
  "/",
  authorize("director", "enrollment", "academic", "accountant"),
  studentController.getAllStudents
);

// Create new student (director, enrollment staff)
router.post(
  "/",
  authorize("director", "enrollment"),
  studentController.createStudent
);

// Get student by ID (self or privileged roles)
router.get(
  "/:id",
  protect,
  (req, res, next) => {
    const allowedRoles = [
      "director",
      "enrollment",
      "academic",
      "accountant",
      "teacher",
    ];
    if (
      String(req.user.id) === String(req.params.id) ||
      allowedRoles.includes(req.user.role)
    ) {
      return next();
    }
    return res.status(403).json({ success: false, message: "Forbidden" });
  },
  studentController.getStudentById
);

// Update student (director, staff, self)
router.put(
  "/:id",
  authorize("director", "enrollment", "academic", "accountant"),
  studentController.updateStudent
);

// Delete student (director only)
router.delete("/:id", authorize("director"), studentController.deleteStudent);

// Get student's courses (self or privileged roles)
router.get(
  "/:id/courses",
  protect,
  (req, res, next) => {
    const allowedRoles = [
      "director",
      "enrollment",
      "academic",
      "accountant",
      "teacher",
    ];
    if (req.user.id === req.params.id || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ success: false, message: "Forbidden" });
  },
  studentController.getStudentCourses
);

// Enroll in course
router.post(
  "/:id/enroll",
  authorize("director", "enrollment"),
  studentController.enrollCourse
);

module.exports = router;
