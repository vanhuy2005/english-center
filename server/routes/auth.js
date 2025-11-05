const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/register-director", authController.registerDirector);
router.post("/login", authController.login);
router.post("/login-student", authController.loginStudent);
router.post("/login-staff", authController.loginStaff);
router.post("/login-teacher", authController.loginTeacher);
router.post("/login-director", authController.loginDirector);
router.get("/me", protect, authController.getMe);

// Giám đốc tạo account
router.post("/create-staff", protect, authController.createStaffByDirector);
router.post("/create-teacher", protect, authController.createTeacherByDirector);
router.post("/create-student", protect, authController.createStudentByDirector);

module.exports = router;
