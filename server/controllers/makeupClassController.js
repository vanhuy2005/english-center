const MakeupClass = require("../models/MakeupClass");
const Course = require("../models/Course");

// Lấy tất cả đơn học bù của học viên
exports.getMyMakeupRequests = async (req, res) => {
  try {
    const makeupRequests = await MakeupClass.find({ studentId: req.user.id })
      .populate("courseId", "courseName")
      .sort({ createdAt: -1 });

    res.json(makeupRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy một đơn học bù
exports.getMakeupRequestById = async (req, res) => {
  try {
    const makeupRequest = await MakeupClass.findById(req.params.id)
      .populate("studentId", "fullName studentId email")
      .populate("courseId", "courseName");

    if (!makeupRequest) {
      return res.status(404).json({ message: "Đơn học bù không tồn tại" });
    }

    res.json(makeupRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo đơn học bù mới
exports.createMakeupRequest = async (req, res) => {
  try {
    const { courseId, courseName, requestedDate, reason, notes } = req.body;

    // Kiểm tra dữ liệu
    if (!courseId || !courseName || !requestedDate || !reason) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    const makeupRequest = new MakeupClass({
      studentId: req.user.id,
      courseId,
      courseName,
      requestedDate: new Date(requestedDate),
      reason,
      notes: notes || null,
    });

    const newMakeupRequest = await makeupRequest.save();

    res.status(201).json({
      success: true,
      message: "Nộp đơn học bù thành công",
      data: newMakeupRequest,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật đơn học bù (chỉ khi đang chờ duyệt)
exports.updateMakeupRequest = async (req, res) => {
  try {
    const makeupRequest = await MakeupClass.findById(req.params.id);

    if (!makeupRequest) {
      return res.status(404).json({ message: "Đơn học bù không tồn tại" });
    }

    // Chỉ có thể cập nhật khi đang chờ duyệt
    if (makeupRequest.status !== "Đang chờ duyệt") {
      return res.status(400).json({ message: "Không thể cập nhật đơn này" });
    }

    // Chỉ học viên nộp đơn mới có thể cập nhật
    if (makeupRequest.studentId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật đơn này" });
    }

    const { courseId, courseName, requestedDate, reason, notes } = req.body;

    if (courseId) makeupRequest.courseId = courseId;
    if (courseName) makeupRequest.courseName = courseName;
    if (requestedDate) makeupRequest.requestedDate = new Date(requestedDate);
    if (reason) makeupRequest.reason = reason;
    if (notes) makeupRequest.notes = notes;

    const updatedMakeupRequest = await makeupRequest.save();

    res.json({
      success: true,
      message: "Cập nhật đơn học bù thành công",
      data: updatedMakeupRequest,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa đơn học bù (chỉ khi đang chờ duyệt)
exports.deleteMakeupRequest = async (req, res) => {
  try {
    const makeupRequest = await MakeupClass.findById(req.params.id);

    if (!makeupRequest) {
      return res.status(404).json({ message: "Đơn học bù không tồn tại" });
    }

    // Chỉ có thể xóa khi đang chờ duyệt
    if (makeupRequest.status !== "Đang chờ duyệt") {
      return res.status(400).json({ message: "Không thể xóa đơn này" });
    }

    // Chỉ học viên nộp đơn mới có thể xóa
    if (makeupRequest.studentId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa đơn này" });
    }

    await MakeupClass.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Xóa đơn học bù thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả đơn học bù (dành cho nhân viên/admin)
exports.getAllMakeupRequests = async (req, res) => {
  try {
    const makeupRequests = await MakeupClass.find()
      .populate("studentId", "fullName studentId email phone")
      .populate("courseId", "courseName")
      .sort({ createdAt: -1 });

    res.json(makeupRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Duyệt đơn học bù
exports.approveMakeupRequest = async (req, res) => {
  try {
    const { approvedDate, notes } = req.body;

    const makeupRequest = await MakeupClass.findByIdAndUpdate(
      req.params.id,
      {
        status: "Được duyệt",
        approvedBy: req.user.id,
        approvedDate: new Date(approvedDate) || new Date(),
        notes: notes || null,
      },
      { new: true }
    );

    if (!makeupRequest) {
      return res.status(404).json({ message: "Đơn học bù không tồn tại" });
    }

    res.json({
      success: true,
      message: "Duyệt đơn học bù thành công",
      data: makeupRequest,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Từ chối đơn học bù
exports.rejectMakeupRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const makeupRequest = await MakeupClass.findByIdAndUpdate(
      req.params.id,
      {
        status: "Từ chối",
        approvedBy: req.user.id,
        rejectionReason: rejectionReason || null,
      },
      { new: true }
    );

    if (!makeupRequest) {
      return res.status(404).json({ message: "Đơn học bù không tồn tại" });
    }

    res.json({
      success: true,
      message: "Từ chối đơn học bù thành công",
      data: makeupRequest,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
