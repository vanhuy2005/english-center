const Student = require("../models/Student");

// Lấy tất cả học viên
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy một học viên
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ message: "Học viên không tồn tại" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo học viên mới
exports.createStudent = async (req, res) => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật học viên
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa học viên
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Học viên đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
