const Staff = require("../models/Staff");

// Lấy tất cả nhân viên
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy nhân viên theo phòng ban
exports.getStaffByDepartment = async (req, res) => {
  try {
    const staff = await Staff.find({ department: req.params.department });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo nhân viên mới
exports.createStaff = async (req, res) => {
  const staff = new Staff(req.body);
  try {
    const newStaff = await staff.save();
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật nhân viên
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa nhân viên
exports.deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Nhân viên đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
