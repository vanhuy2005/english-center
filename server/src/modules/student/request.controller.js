const Request = require("../../shared/models/Request.model");
const Course = require("../../shared/models/Course.model");
const {
  successResponse,
  errorResponse,
} = require("../../shared/utils/response.util");

/**
 * @desc    Enroll in course (direct enrollment, no approval needed)
 * @route   POST /api/student/enroll-course
 * @access  Private (student only)
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId, reason, studentId: bodyStudentId } = req.body;
    // Prefer authenticated user but allow body studentId as a fallback (useful in dev/debug)
    const studentId = (req.user && req.user._id) || bodyStudentId;

    console.log("[enrollCourse] Incoming payload:", {
      courseId,
      reason,
      studentIdFallback: bodyStudentId ? true : false,
      authUser: !!(req.user && req.user._id),
    });

    if (!courseId) {
      return errorResponse(res, "Vui lòng chọn khóa học", 400);
    }

    // Provide a sensible default reason if missing
    const reqReason =
      reason && reason.trim() ? reason.trim() : "Đăng ký trực tuyến";

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, "Khóa học không tồn tại", 404);
    }

    // Check if student exists
    const Student = require("../../shared/models/Student.model");
    const student = await Student.findById(studentId);
    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    // Check if student already enrolled in this course
    if (
      student.enrolledCourses &&
      student.enrolledCourses.map((c) => String(c)).includes(String(courseId))
    ) {
      return errorResponse(res, "Bạn đã đăng ký khóa học này rồi", 400);
    }

    const enrollmentRequest = await Request.create({
      student: studentId,
      type: "course_enrollment",
      course: courseId,
      reason: reqReason,
      status: "pending",
    });

    // Create Finance record for tuition (student must still pay after approval)
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
      notes: reqReason,
      createdBy: studentId,
    });

    const populatedFinance = await Finance.findById(financeRecord._id)
      .populate("course", "name courseCode fee duration")
      .populate("student", "fullName studentCode phone email");

    // Create notification for student about pending request
    const Notification = require("../../shared/models/Notification.model");
    await Notification.create({
      recipient: studentId,
      type: "system",
      title: "Yêu cầu đăng ký khóa học đã được gửi",
      message: `Yêu cầu đăng ký khóa học ${course.name} đã được gửi đến học vụ để xử lý. Bạn sẽ được thông báo khi được xếp lớp.`,
      link: "/requests",
      priority: "normal",
    });

    // Create notification for academic staff about new enrollment request
    const Staff = require("../../shared/models/Staff.model");
    const academicStaff = await Staff.find({
      staffType: "academic",
      status: "active",
    }).select("_id");

    const academicNotifications = academicStaff.map((staff) => ({
      recipient: staff._id,
      type: "request_response",
      title: `Yêu cầu đăng ký khóa học mới`,
      message: `${student.fullName} (${student.studentCode}) đã gửi yêu cầu đăng ký khóa học ${course.name}. Vui lòng xử lý.`,
      link: "/staff/academic/requests",
      relatedModel: "Request",
      relatedId: enrollmentRequest._id,
      priority: "high",
    }));

    // Create notification for accountant staff about new finance record
    const accountantStaff = await Staff.find({
      staffType: "accountant",
      status: "active",
    }).select("_id");

    const accountantNotifications = accountantStaff.map((staff) => ({
      recipient: staff._id,
      type: "payment_reminder",
      title: `Khoản thu mới: Học phí`,
      message: `${student.fullName} (${
        student.studentCode
      }) đã đăng ký khóa học ${
        course.name
      }. Số tiền: ${feeAmount.toLocaleString("vi-VN")}đ.`,
      link: "/staff/accountant/finance",
      relatedModel: "Finance",
      relatedId: financeRecord._id,
      priority: "normal",
    }));

    if (academicNotifications.length > 0) {
      await Notification.insertMany(academicNotifications);
    }

    if (accountantNotifications.length > 0) {
      await Notification.insertMany(accountantNotifications);
    }

    // Respond with the created request and finance info
    successResponse(
      res,
      { request: enrollmentRequest, finance: populatedFinance },
      "Yêu cầu đăng ký đã được gửi",
      201
    );
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
      Request.countDocuments(query),
    ]);

    successResponse(
      res,
      {
        requests,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      "Lấy danh sách yêu cầu thành công"
    );
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
