const LeaveRequest = require("../models/LeaveRequest");
const Student = require("../models/Student");

// Lấy tất cả đơn xin nghỉ của học viên
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      studentId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy một đơn xin nghỉ
exports.getLeaveRequestById = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id).populate(
      "studentId",
      "fullName studentId"
    );

    if (!leaveRequest) {
      return res.status(404).json({ message: "Đơn xin nghỉ không tồn tại" });
    }

    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo đơn xin nghỉ mới
exports.createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, attachment } = req.body;

    // Kiểm tra dữ liệu
    if (!leaveType || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Tính số ngày
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (numberOfDays <= 0) {
      return res
        .status(400)
        .json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
    }

    const leaveRequest = new LeaveRequest({
      studentId: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      attachment: attachment || null,
      numberOfDays,
    });

    const newLeaveRequest = await leaveRequest.save();

    res.status(201).json({
      success: true,
      message: "Nộp đơn xin nghỉ thành công",
      data: newLeaveRequest,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật đơn xin nghỉ (chỉ khi đang chờ duyệt)
exports.updateLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: "Đơn xin nghỉ không tồn tại" });
    }

    // Chỉ có thể cập nhật khi đang chờ duyệt
    if (leaveRequest.status !== "Đang chờ duyệt") {
      return res.status(400).json({ message: "Không thể cập nhật đơn này" });
    }

    // Chỉ học viên nộp đơn mới có thể cập nhật
    if (leaveRequest.studentId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật đơn này" });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (leaveType) leaveRequest.leaveType = leaveType;
    if (startDate) leaveRequest.startDate = new Date(startDate);
    if (endDate) leaveRequest.endDate = new Date(endDate);
    if (reason) leaveRequest.reason = reason;

    // Tính lại số ngày nếu có thay đổi
    if (startDate || endDate) {
      const start = new Date(leaveRequest.startDate);
      const end = new Date(leaveRequest.endDate);
      leaveRequest.numberOfDays =
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    const updatedLeaveRequest = await leaveRequest.save();

    res.json({
      success: true,
      message: "Cập nhật đơn xin nghỉ thành công",
      data: updatedLeaveRequest,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa đơn xin nghỉ (chỉ khi đang chờ duyệt)
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: "Đơn xin nghỉ không tồn tại" });
    }

    // Chỉ có thể xóa khi đang chờ duyệt
    if (leaveRequest.status !== "Đang chờ duyệt") {
      return res.status(400).json({ message: "Không thể xóa đơn này" });
    }

    // Chỉ học viên nộp đơn mới có thể xóa
    if (leaveRequest.studentId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa đơn này" });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Xóa đơn xin nghỉ thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả đơn xin nghỉ (dành cho nhân viên/admin)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate("studentId", "fullName studentId email phone")
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Duyệt đơn xin nghỉ (dành cho nhân viên/admin)
exports.approveLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Đã duyệt", approvedBy: req.user.id },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({ message: "Đơn xin nghỉ không tồn tại" });
    }

    res.json({
      success: true,
      message: "Duyệt đơn thành công",
      data: leaveRequest,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Từ chối đơn xin nghỉ (dành cho nhân viên/admin)
exports.rejectLeaveRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Từ chối",
        approvedBy: req.user.id,
        rejectionReason: rejectionReason || null,
      },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({ message: "Đơn xin nghỉ không tồn tại" });
    }

    res.json({
      success: true,
      message: "Từ chối đơn thành công",
      data: leaveRequest,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
