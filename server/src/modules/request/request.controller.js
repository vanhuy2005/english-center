const Request = require("../../shared/models/Request.model");
const Student = require("../../shared/models/Student.model");
const Class = require("../../shared/models/Class.model");

/**
 * @desc    Get all requests with filters
 * @route   GET /api/requests
 * @access  Private
 */
exports.getAllRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      student,
      type,
      status,
      priority,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (student) filter.student = student;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await Request.find(filter)
      .populate("student", "studentCode fullName email phone")
      .populate("class", "className classCode")
      .populate("targetClass", "className classCode")
      .populate("processedBy", "fullName")
      .sort({ createdAt: -1, priority: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách yêu cầu",
      error: error.message,
    });
  }
};

/**
 * @desc    Get request by ID
 * @route   GET /api/requests/:id
 * @access  Private
 */
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("student", "studentCode fullName email phone address")
      .populate("class", "className classCode teacher")
      .populate("targetClass", "className classCode teacher")
      .populate("processedBy", "fullName email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin yêu cầu",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new request
 * @route   POST /api/requests
 * @access  Private (student, staff, director)
 */
exports.createRequest = async (req, res) => {
  try {
    const {
      student,
      type,
      class: classId,
      targetClass,
      startDate,
      endDate,
      reason,
      documents,
      priority,
    } = req.body;

    console.log("Request body:", req.body);

    if (!student || !type || !reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc",
      });
    }

    // Verify student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Học viên không tồn tại",
      });
    }

    // Verify class exists (if provided)
    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: "Lớp học không tồn tại",
        });
      }
    }

    // For transfer requests, verify target class
    if (type === "transfer" && targetClass) {
      const targetClassExists = await Class.findById(targetClass);
      if (!targetClassExists) {
        return res.status(404).json({
          success: false,
          message: "Lớp học đích không tồn tại",
        });
      }
    }

    const request = await Request.create({
      student,
      type,
      class: classId,
      targetClass,
      startDate,
      endDate,
      reason,
      documents,
      priority: priority || "normal",
    });

    const populatedRequest = await Request.findById(request._id)
      .populate("student", "studentCode fullName")
      .populate("class", "className classCode")
      .populate("targetClass", "className classCode");

    res.status(201).json({
      success: true,
      message: "Tạo yêu cầu thành công",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo yêu cầu",
      error: error.message,
    });
  }
};

/**
 * @desc    Update request
 * @route   PUT /api/requests/:id
 * @access  Private
 */
exports.updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    // Only allow updates if request is still pending
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể chỉnh sửa yêu cầu đang chờ xử lý",
      });
    }

    const allowedUpdates = [
      "type",
      "class",
      "targetClass",
      "startDate",
      "endDate",
      "reason",
      "documents",
      "priority",
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        request[key] = req.body[key];
      }
    });

    await request.save();

    const updatedRequest = await Request.findById(request._id)
      .populate("student", "studentCode fullName")
      .populate("class", "className classCode")
      .populate("targetClass", "className classCode");

    res.status(200).json({
      success: true,
      message: "Cập nhật yêu cầu thành công",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật yêu cầu",
      error: error.message,
    });
  }
};

/**
 * @desc    Process request (approve/reject)
 * @route   PATCH /api/requests/:id/process
 * @access  Private (director, academic staff)
 */
exports.processRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu đã được xử lý",
      });
    }

    const { status, adminResponse } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    request.status = status;
    request.adminResponse = adminResponse;
    request.processedBy = req.user._id;
    request.processedAt = new Date();

    await request.save();

    // TODO: Send notification to student
    // TODO: If approved, process the request (e.g., transfer student to target class)

    const updatedRequest = await Request.findById(request._id)
      .populate("student", "studentCode fullName email")
      .populate("class", "className classCode")
      .populate("targetClass", "className classCode")
      .populate("processedBy", "fullName");

    res.status(200).json({
      success: true,
      message:
        status === "approved" ? "Đã phê duyệt yêu cầu" : "Đã từ chối yêu cầu",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xử lý yêu cầu",
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel request
 * @route   PATCH /api/requests/:id/cancel
 * @access  Private (student, staff, director)
 */
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy yêu cầu đang chờ xử lý",
      });
    }

    request.status = "cancelled";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Đã hủy yêu cầu",
      data: request,
    });
  } catch (error) {
    console.error("Error cancelling request:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi hủy yêu cầu",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete request
 * @route   DELETE /api/requests/:id
 * @access  Private (director)
 */
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa yêu cầu thành công",
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa yêu cầu",
      error: error.message,
    });
  }
};

/**
 * @desc    Get student's requests
 * @route   GET /api/requests/student/:studentId
 * @access  Private
 */
exports.getStudentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ student: req.params.studentId })
      .populate("class", "className classCode")
      .populate("targetClass", "className classCode")
      .populate("processedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy yêu cầu của học viên",
      error: error.message,
    });
  }
};

/**
 * @desc    Get request statistics
 * @route   GET /api/requests/stats
 * @access  Private (director, staff)
 */
exports.getRequestStats = async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const typeStats = await Request.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      total: await Request.countDocuments(),
      pending: await Request.countDocuments({ status: "pending" }),
    };

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error fetching request stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê yêu cầu",
      error: error.message,
    });
  }
};
