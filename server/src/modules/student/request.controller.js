const Request = require("../../shared/models/Request.model");
const Course = require("../../shared/models/Course.model");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

/**
 * @desc    Enroll in course (direct enrollment, no approval needed)
 * @route   POST /api/student/enroll-course
 * @access  Private (student only)
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId, reason } = req.body;
    const studentId = req.user._id;

    if (!courseId || !reason) {
      return errorResponse(res, "Vui lòng chọn khóa học và nhập lý do", 400);
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, "Khóa học không tồn tại", 404);
    }

    // Check if student already enrolled in this course
    const Student = require("../../shared/models/Student.model");
    const student = await Student.findById(studentId);
    if (student.enrolledCourses && student.enrolledCourses.includes(courseId)) {
      return errorResponse(res, "Bạn đã đăng ký khóa học này rồi", 400);
    }

    // Add course to student's enrolledCourses
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { enrolledCourses: courseId }
    });

    // Create Finance record for tuition
    const Finance = require("../../shared/models/Finance.model");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    const feeAmount = course.fee?.amount || 0;
    
    const financeRecord = await Finance.create({
      student: studentId,
      course: courseId,
      type: "tuition",
      amount: feeAmount,
      paidAmount: 0,
      remainingAmount: feeAmount,
      status: "pending",
      dueDate: dueDate,
      paymentMethod: "cash",
      description: `Học phí khóa học ${course.name}`,
      notes: reason.trim(),
      createdBy: studentId
    });

    const populatedFinance = await Finance.findById(financeRecord._id)
      .populate("course", "name courseCode fee duration")
      .populate("student", "fullName studentCode phone email");

    // Create notification for student
    const Notification = require("../../shared/models/Notification.model");
    await Notification.create({
      recipient: studentId,
      type: "system",
      title: "Đăng ký khóa học thành công",
      message: `Bạn đã đăng ký khóa học ${course.name} thành công. Vui lòng thanh toán học phí trước ${dueDate.toLocaleDateString('vi-VN')}.`,
      link: "/student/tuition",
      priority: "normal"
    });

    successResponse(res, populatedFinance, "Đăng ký khóa học thành công", 201);
  } catch (error) {
    console.error("Enroll Course Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get student's requests
 * @route   GET /api/student/requests
 * @access  Private (student only)
 */
exports.getMyRequests = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { type, status, page = 1, limit = 20 } = req.query;

    const query = { student: studentId };
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate("course", "name courseCode fee")
        .populate("class", "name classCode")
        .populate("targetClass", "name classCode")
        .populate("processedBy", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Request.countDocuments(query)
    ]);

    successResponse(res, {
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }, "Lấy danh sách yêu cầu thành công");
  } catch (error) {
    console.error("Get My Requests Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Cancel request
 * @route   PUT /api/student/requests/:id/cancel
 * @access  Private (student only)
 */
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const request = await Request.findOne({ _id: id, student: studentId });

    if (!request) {
      return errorResponse(res, "Không tìm thấy yêu cầu", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Chỉ có thể hủy yêu cầu đang chờ xử lý", 400);
    }

    request.status = "cancelled";
    await request.save();

    successResponse(res, request, "Hủy yêu cầu thành công");
  } catch (error) {
    console.error("Cancel Request Error:", error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = exports;
