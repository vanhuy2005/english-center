const express = require("express");
const router = express.Router();
const requestController = require("./request.controller");
const { protect, authorize } = require("../../shared/middleware/auth.middleware");

// All routes require authentication and student role
router.use(protect);
router.use(authorize("student"));

// @route   POST /api/student/enroll-course (Direct enrollment, no approval)
router.post("/enroll-course", requestController.enrollCourse);

// @route   POST /api/student/requests/course-enrollment (Legacy - same as enroll-course)
router.post("/course-enrollment", requestController.enrollCourse);

// @route   GET /api/student/requests
router.get("/", requestController.getMyRequests);

// @route   PUT /api/student/requests/:id/cancel
router.put("/:id/cancel", requestController.cancelRequest);

module.exports = router;
