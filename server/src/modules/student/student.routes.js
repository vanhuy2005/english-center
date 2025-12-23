const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../../../middleware/auth");
const studentController = require("./student.controller");

// Protected routes - require authentication
router.use(auth);

// ===== STUDENT SELF-SERVICE ROUTES =====
// Get my enrolled classes with schedules
router.get("/me/classes", studentController.getMyEnrolledClasses);

// Get my courses
router.get("/me/courses", studentController.getMyCourses);

// Get my grades
router.get("/me/grades", studentController.getMyGrades);

// Get my attendance
router.get("/me/attendance", studentController.getMyAttendance);

// Get my tuition info
router.get("/me/tuition", studentController.getMyTuition);

// Get my requests
router.get("/me/requests", studentController.getMyRequests);

// Create new request
router.post("/me/requests", studentController.createRequest);

// Upload avatar
const multer = require("multer");
const upload = multer({ dest: "uploads/avatars/" });
router.post(
  "/me/avatar",
  upload.single("avatar"),
  studentController.uploadAvatar
);

// ===== ADMIN/STAFF ROUTES =====
// Get all students (director, staff)
router.get(
  "/",
  checkRole(["director", "enrollment", "academic", "accountant"]),
  studentController.getAllStudents
);

// Create new student (director, enrollment staff)
router.post(
  "/",
  checkRole(["director", "enrollment"]),
  studentController.createStudent
);

// Get student by ID
router.get("/:id", studentController.getStudentById);

// Update student
router.put(
  "/:id",
  checkRole(["director", "enrollment", "academic", "accountant"]),
  studentController.updateStudent
);

// Delete student (director only)
router.delete("/:id", checkRole(["director"]), studentController.deleteStudent);

// Get student's courses
router.get("/:id/courses", studentController.getStudentCourses);

// Enroll in course
router.post(
  "/:id/enroll",
  checkRole(["director", "enrollment"]),
  studentController.enrollCourse
);

module.exports = router;
