const Request = require("../../shared/models/Request.model");
const Course = require("../../shared/models/Course.model");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

/**
 * @desc    Enroll in course - Auto complete enrollment
 * @route   POST /api/student/requests/course-enrollment
 * @access  Private (student only)
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId, fullName, phone, email, dateOfBirth, address, note } = req.body;
    const studentId = req.user._id;

    if (!courseId || !fullName || !phone || !email || !dateOfBirth || !address) {
      return errorResponse(res, "Vui lòng nhập đầy đủ thông tin bắt buộc", 400);
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, "Khóa học không tồn tại", 404);
    }

    // Check if student already enrolled in this course (check Finance records)
    const Finance = require("../../shared/models/Finance.model");
    const existingEnrollment = await Finance.findOne({
      student: studentId,
      course: courseId,
      type: "tuition",
      status: { $in: ["pending", "paid", "partial"] }
    });
    
    if (existingEnrollment) {
      return errorResponse(res, "Bạn đã đăng ký khóa học này rồi", 400);
    }

    // Update student info and add to enrolledCourses
    const Student = require("../../shared/models/Student.model");
    await Student.findByIdAndUpdate(studentId, {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      dateOfBirth: new Date(dateOfBirth),
      address: address.trim(),
      $addToSet: { enrolledCourses: courseId }
    });

    // Create Finance record for tuition
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
      notes: note?.trim() || `Đăng ký khóa học ${course.name}`,
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
      priority: "high"
    });

    successResponse(res, populatedFinance, "Đăng ký khóa học thành công! Vui lòng thanh toán học phí.", 201);
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

/**
 * @desc    Register for consultation
 * @route   POST /api/student/requests/consultation
 * @access  Public
 */
exports.registerConsultation = async (req, res) => {
  try {
    const { courseId, fullName, phone, email, note, preferredContactTime } = req.body;

    if (!fullName || !phone) {
      return errorResponse(res, "Vui lòng nhập họ tên và số điện thoại", 400);
    }

    // Check if course exists
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return errorResponse(res, "Khóa học không tồn tại", 404);
      }
    }

    // Create consultation request
    const request = await Request.create({
      student: req.user?._id || null, // Can be null for non-logged-in users
      type: "consultation",
      course: courseId || null,
      consultationInfo: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email?.trim() || "",
        note: note?.trim() || "",
        preferredContactTime: preferredContactTime?.trim() || ""
      },
      status: "pending",
      priority: "normal"
    });

    // Populate course info
    const populatedRequest = await Request.findById(request._id)
      .populate("course", "name courseCode fee");

    // Create notifications for enrollment staff
    const Staff = require("../../shared/models/Staff.model");
    const Notification = require("../../shared/models/Notification.model");
    
    const enrollmentStaff = await Staff.find({ 
      role: "enrollment",
      status: "active" 
    });

    const notificationPromises = enrollmentStaff.map(staff => 
      Notification.create({
        recipient: staff._id,
        type: "request",
        title: "Yêu cầu tư vấn mới",
        message: `${fullName} (${phone}) yêu cầu tư vấn${courseId ? ` về khóa học ${populatedRequest.course?.name}` : ''}`,
        link: `/staff/requests/${request._id}`,
        priority: "normal"
      })
    );

    await Promise.all(notificationPromises);

    successResponse(res, populatedRequest, "Đã gửi yêu cầu tư vấn thành công. Chúng tôi sẽ liên hệ với bạn sớm!", 201);
  } catch (error) {
    console.error("Register Consultation Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Register for placement test
 * @route   POST /api/student/requests/placement-test
 * @access  Public
 */
exports.registerPlacementTest = async (req, res) => {
  try {
    const { fullName, phone, dateOfBirth, desiredTestDate } = req.body;

    if (!fullName || !phone || !dateOfBirth || !desiredTestDate) {
      return errorResponse(res, "Vui lòng nhập đầy đủ họ tên, số điện thoại, ngày sinh và ngày thi mong muốn", 400);
    }

    // If logged in, check if student already has pending placement test
    if (req.user) {
      const existingRequest = await Request.findOne({
        student: req.user._id,
        type: "placement_test",
        status: "pending"
      });

      if (existingRequest) {
        return errorResponse(res, "Bạn đã có yêu cầu thi đầu vào đang chờ xử lý", 400);
      }
    }

    // Create placement test request
    const request = await Request.create({
      student: req.user?._id || null,
      type: "placement_test",
      placementTestInfo: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: new Date(dateOfBirth),
        scheduledDate: new Date(desiredTestDate)
      },
      status: "pending",
      priority: "high"
    });

    // Update student info if logged in
    if (req.user) {
      const Student = require("../../shared/models/Student.model");
      await Student.findByIdAndUpdate(req.user._id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: new Date(dateOfBirth)
      }, { runValidators: false });
    }

    // Create notifications for academic staff
    const Staff = require("../../shared/models/Staff.model");
    const Notification = require("../../shared/models/Notification.model");
    
    const academicStaff = await Staff.find({ 
      role: "academic_staff",
      status: "active" 
    });

    const notificationPromises = academicStaff.map(staff => 
      Notification.create({
        recipient: staff._id,
        type: "request",
        title: "Đăng ký thi đầu vào mới",
        message: `${fullName} (${phone}) đăng ký thi đầu vào`,
        link: `/staff/requests/${request._id}`,
        priority: "high"
      })
    );

    // Notify student if logged in
    if (req.user) {
      notificationPromises.push(
        Notification.create({
          recipient: req.user._id,
          type: "system",
          title: "Đăng ký thi đầu vào thành công",
          message: "Yêu cầu của bạn đã được gửi. Chúng tôi sẽ liên hệ để sắp xếp lịch thi trong vòng 24h.",
          link: "/student/requests",
          priority: "normal"
        })
      );
    }

    await Promise.all(notificationPromises);

    successResponse(res, request, "Đăng ký thi đầu vào thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24h.", 201);
  } catch (error) {
    console.error("Register Placement Test Error:", error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = exports;
