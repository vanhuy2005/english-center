const Request = require("../../../shared/models/Request.model");
const Student = require("../../../shared/models/Student.model");
const Course = require("../../../shared/models/Course.model");
const Finance = require("../../../shared/models/Finance.model");
const { successResponse, errorResponse } = require("../../../shared/utils/response.util");

/**
 * @desc    Get all requests (for academic staff)
 * @route   GET /api/staff/academic/requests
 * @access  Private (academic staff only)
 */
exports.getAllRequests = async (req, res) => {
  try {
    const { type, status, priority, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate("student", "fullName studentCode phone email")
        .populate("course", "name courseCode fee")
        .populate("class", "name classCode")
        .populate("targetClass", "name classCode")
        .populate("processedBy", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Request.countDocuments(query)
    ]);

    // Filter by search if provided
    let filteredRequests = requests;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRequests = requests.filter(req => 
        req.student?.fullName?.toLowerCase().includes(searchLower) ||
        req.student?.studentCode?.toLowerCase().includes(searchLower) ||
        req.requestCode?.toLowerCase().includes(searchLower)
      );
    }

    successResponse(res, {
      requests: filteredRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }, "Lấy danh sách yêu cầu thành công");
  } catch (error) {
    console.error("Get All Requests Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get request by ID
 * @route   GET /api/staff/academic/requests/:id
 * @access  Private (academic staff only)
 */
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id)
      .populate("student", "fullName studentCode phone email dateOfBirth gender address")
      .populate("course", "name courseCode fee duration level")
      .populate("class", "name classCode schedule")
      .populate("targetClass", "name classCode schedule")
      .populate("processedBy", "fullName staffCode");

    if (!request) {
      return errorResponse(res, "Không tìm thấy yêu cầu", 404);
    }

    successResponse(res, request, "Lấy thông tin yêu cầu thành công");
  } catch (error) {
    console.error("Get Request By ID Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Approve course enrollment request
 * @route   PUT /api/staff/academic/requests/:id/approve
 * @access  Private (academic staff only)
 */
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const staffId = req.user._id;

    const request = await Request.findById(id);

    if (!request) {
      return errorResponse(res, "Không tìm thấy yêu cầu", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Yêu cầu đã được xử lý", 400);
    }

    // Approve request
    await request.approve(staffId, note);

    // If course enrollment, add course to student's enrolledCourses and create finance record
    if (request.type === "course_enrollment" && request.course) {
      // Add course to student
      await Student.findByIdAndUpdate(request.student, {
        $addToSet: { enrolledCourses: request.course }
      });

      // Get course details for fee
      const course = await Course.findById(request.course);
      if (course && course.fee) {
        // Create finance record for tuition
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

        await Finance.create({
          student: request.student,
          course: request.course,
          type: "tuition",
          amount: course.fee,
          paidAmount: 0,
          remainingAmount: course.fee,
          status: "pending",
          dueDate: dueDate,
          paymentMethod: "cash", // Default, can be changed when payment is made
          description: `Học phí khóa học ${course.name}`,
          createdBy: staffId
        });
      }
    }

    const updatedRequest = await Request.findById(id)
      .populate("student", "fullName studentCode")
      .populate("course", "name courseCode")
      .populate("processedBy", "fullName");

    const Notification = require("../../../shared/models/Notification.model");
    const noteText = note ? ` Ghi chú: ${note}` : '';
    await Notification.create({
      recipient: updatedRequest.student._id || updatedRequest.student,
      sender: staffId,
      type: "request_response",
      title: "Yêu cầu đã được phê duyệt",
      message: `Yêu cầu của bạn đã được phê duyệt.${noteText}`,
      link: "/student/requests",
      priority: "normal"
    });

    successResponse(res, updatedRequest, "Phê duyệt yêu cầu thành công");
  } catch (error) {
    console.error("Approve Request Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Reject request
 * @route   PUT /api/staff/academic/requests/:id/reject
 * @access  Private (academic staff only)
 */
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, note } = req.body;
    const staffId = req.user._id;

    if (!reason) {
      return errorResponse(res, "Vui lòng nhập lý do từ chối", 400);
    }

    const request = await Request.findById(id);

    if (!request) {
      return errorResponse(res, "Không tìm thấy yêu cầu", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Yêu cầu đã được xử lý", 400);
    }

    await request.reject(staffId, reason, note);

    const updatedRequest = await Request.findById(id)
      .populate("student", "fullName studentCode")
      .populate("course", "name courseCode")
      .populate("processedBy", "fullName");

    const Notification = require("../../../shared/models/Notification.model");
    const noteText = note ? ` Ghi chú: ${note}` : '';
    await Notification.create({
      recipient: updatedRequest.student._id || updatedRequest.student,
      sender: staffId,
      type: "request_response",
      title: "Yêu cầu bị từ chối",
      message: `Yêu cầu của bạn đã bị từ chối. Lý do: ${reason}.${noteText}`,
      link: "/student/requests",
      priority: "normal"
    });

    successResponse(res, updatedRequest, "Từ chối yêu cầu thành công");
  } catch (error) {
    console.error("Reject Request Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get request statistics
 * @route   GET /api/staff/academic/requests/stats
 * @access  Private (academic staff only)
 */
exports.getRequestStats = async (req, res) => {
  try {
    const [pending, approved, rejected, byType] = await Promise.all([
      Request.countDocuments({ status: "pending" }),
      Request.countDocuments({ status: "approved" }),
      Request.countDocuments({ status: "rejected" }),
      Request.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    successResponse(res, stats, "Lấy thống kê yêu cầu thành công");
  } catch (error) {
    console.error("Get Request Stats Error:", error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = exports;
