const Course = require("../models/Course");

// Lấy tất cả khóa học
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy một khóa học
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ message: "Khóa học không tồn tại" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo khóa học mới
exports.createCourse = async (req, res) => {
  const course = new Course(req.body);
  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật khóa học
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa khóa học
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Khóa học đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
