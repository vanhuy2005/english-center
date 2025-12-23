const express = require("express");
const router = express.Router();

// Import models
let Enrollment, Course, Student;
try {
  Enrollment = require("../models/Enrollment");
  Course = require("../models/Course");
  Student = require("../models/Student");
} catch (e) {
  console.log("Models not found, using mock mode");
}

// Middleware để check auth (optional)
const auth = (req, res, next) => {
  next();
};

// POST - Đăng ký khóa học
router.post("/course-enrollments", auth, async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    console.log("Enrollment request:", { courseId, studentId });

    // Validate
    if (!courseId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp courseId và studentId",
      });
    }

    // Nếu không có models, trả về success (mock mode)
    if (!Enrollment || !Course || !Student) {
      console.log("Running in mock mode");
      return res.status(201).json({
        success: true,
        message: "Đăng ký khóa học thành công (mock mode)",
        data: {
          _id: "mock_" + Date.now(),
          course: courseId,
          student: studentId,
          enrollmentDate: new Date(),
          status: "active",
          paymentStatus: "pending",
        },
      });
    }

    // Kiểm tra khóa học có tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    // Kiểm tra học viên có tồn tại
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Học viên không tồn tại",
      });
    }

    // Kiểm tra học viên đã đăng ký khóa học này chưa
    const existingEnrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "Học viên đã đăng ký khóa học này",
      });
    }

    // Kiểm tra khóa học có còn chỗ không
    const enrollmentCount = await Enrollment.countDocuments({
      course: courseId,
    });
    if (enrollmentCount >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "Khóa học đã đủ học viên",
      });
    }

    // Tạo enrollment mới
    const enrollment = new Enrollment({
      course: courseId,
      student: studentId,
      enrollmentDate: new Date(),
      status: "active",
      paymentStatus: "pending",
    });

    await enrollment.save();

    // Cập nhật số lượng học viên trong khóa học
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    });

    // Thêm khóa học vào danh sách của học viên
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { courses: courseId },
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký khóa học thành công",
      data: enrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi đăng ký khóa học",
      error: error.message,
    });
  }
});

// GET - Lấy danh sách đăng ký của học viên
router.get("/my-enrollments", auth, async (req, res) => {
  try {
    const studentId = req.user?.studentId || req.query.studentId;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp studentId",
      });
    }

    // Mock mode
    if (!Enrollment) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const enrollments = await Enrollment.find({ student: studentId })
      .populate(
        "course",
        "name code description level tuition startDate endDate"
      )
      .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách đăng ký",
      error: error.message,
    });
  }
});

// GET - Lấy chi tiết 1 enrollment
router.get("/:id", auth, async (req, res) => {
  try {
    if (!Enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    const enrollment = await Enrollment.findById(req.params.id)
      .populate("course")
      .populate("student");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Đăng ký không tồn tại",
      });
    }

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy chi tiết đăng ký",
      error: error.message,
    });
  }
});

// DELETE - Hủy đăng ký
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!Enrollment) {
      return res.json({
        success: true,
        message: "Hủy đăng ký thành công (mock mode)",
      });
    }

    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Đăng ký không tồn tại",
      });
    }

    // Giảm số lượng học viên trong khóa học
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { enrollmentCount: -1 },
    });

    res.json({
      success: true,
      message: "Hủy đăng ký thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hủy đăng ký",
      error: error.message,
    });
  }
});

module.exports = router;
