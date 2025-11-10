const express = require("express");
const router = express.Router();
const { protect } = require("../../shared/middleware/auth.middleware");
const teacherController = require("./teacher.controller");

// Protect all teacher routes
router.use(protect);

// Dashboard
router.get("/dashboard", teacherController.getDashboard);

// Classes
router.get("/classes", teacherController.getMyClasses);
router.get("/classes/:classId", teacherController.getClassDetail);
router.get("/classes/:classId/students", teacherController.getClassStudents);
router.get("/classes/:classId/sessions", teacherController.getClassSessions);
router.post("/classes/:classId/sessions", teacherController.createSession);
router.get(
  "/classes/:classId/statistics",
  teacherController.getClassStatistics
);

// Attendance
router.get("/attendance/:sessionId", teacherController.getSessionAttendance);
router.post("/attendance/:sessionId", teacherController.markAttendance);

// Grades
router.get("/classes/:classId/grades", teacherController.getClassGrades);
router.post("/classes/:classId/grades", teacherController.saveGrades);

// Evaluations
router.get(
  "/classes/:classId/evaluations",
  teacherController.getClassEvaluations
);
router.post("/classes/:classId/evaluations", teacherController.saveEvaluations);

// Schedule
router.get("/schedule", teacherController.getSchedule);

// Notifications
router.get("/notifications", teacherController.getNotifications);
router.patch(
  "/notifications/:notificationId/read",
  teacherController.markNotificationAsRead
);
router.patch(
  "/notifications/read-all",
  teacherController.markAllNotificationsAsRead
);
router.delete(
  "/notifications/:notificationId",
  teacherController.deleteNotification
);

module.exports = router;
