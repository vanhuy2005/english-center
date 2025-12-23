const express = require("express");
const router = express.Router();
const {
  protect,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const enrollmentController = require("./enrollment.controller");

router.use(protect);
// Allow both enrollment staff and academic staff to access assignment endpoints
router.use(authorize("enrollment", "academic"));

// Dashboard
router.get("/dashboard", enrollmentController.getDashboardStats);

// Student Management
router.get("/students", enrollmentController.getAllStudents);
router.post("/students", enrollmentController.createStudent);
router.get("/students/:id", enrollmentController.getStudentById);
router.put("/students/:id", enrollmentController.updateStudent);
router.post("/students/:id/enroll", enrollmentController.enrollStudent);

// Class Management
router.get("/classes", enrollmentController.getAllClasses);

// Request Management
router.get("/requests", enrollmentController.getEnrollmentRequests);
router.put("/requests/:id", enrollmentController.processRequest);

// Statistics
router.get("/statistics", enrollmentController.getEnrollmentStatistics);

module.exports = router;
