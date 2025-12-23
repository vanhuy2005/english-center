const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// GET tất cả khóa học
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "fullName email")
      .select(
        "name code description level duration maxStudents tuition startDate endDate status enrollmentCount"
      )
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách khóa học",
      error: error.message,
    });
  }
});

// GET khóa học khả dụng (chưa bắt đầu hoặc đang diễn ra)
router.get("/available", async (req, res) => {
  try {
    const now = new Date();
    const courses = await Course.find({
      status: { $in: ["upcoming", "active"] },
      startDate: { $gt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // 30 ngày trước
    })
      .populate("instructor", "fullName email")
      .select(
        "name code description level duration maxStudents tuition startDate endDate status enrollmentCount"
      )
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách khóa học khả dụng",
      error: error.message,
    });
  }
});

// GET chi tiết 1 khóa học
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "fullName email")
      .populate("students", "fullName email studentCode");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy chi tiết khóa học",
      error: error.message,
    });
  }
});

// POST tạo khóa học mới
router.post("/", async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      level,
      duration,
      maxStudents,
      tuition,
      startDate,
      endDate,
      instructor,
    } = req.body;

    // Validate required fields
    if (!name || !tuition || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tên, học phí và ngày bắt đầu",
      });
    }

    const newCourse = new Course({
      name,
      code,
      description,
      level,
      duration: duration || { hours: 60, weeks: 12 },
      maxStudents: maxStudents || 30,
      tuition, // MAIN - Lưu giá tiền
      startDate,
      endDate,
      instructor,
      createdBy: req.user?.id,
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Tạo khóa học thành công",
      data: newCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tạo khóa học",
      error: error.message,
    });
  }
});

// PUT cập nhật khóa học
router.put("/:id", async (req, res) => {
  try {
    const { name, description, level, tuition, maxStudents, status } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        level,
        tuition, // MAIN - Cập nhật giá tiền
        maxStudents,
        status,
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật khóa học thành công",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật khóa học",
      error: error.message,
    });
  }
});

module.exports = router;
