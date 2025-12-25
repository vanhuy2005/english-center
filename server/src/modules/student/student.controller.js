const mongoose = require("mongoose");
const Student = require("../../shared/models/Student.model");
const Class = require("../../shared/models/Class.model");
const Grade = require("../../shared/models/Grade.model");
const Attendance = require("../../shared/models/Attendance.model");
const Finance = require("../../shared/models/Finance.model");
const Request = require("../../shared/models/Request.model");
const Notification = require("../../shared/models/Notification.model");
const Staff = require("../../shared/models/Staff.model");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../../shared/utils/response.util");

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private (director, staff)
 */
exports.getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Whitelist of allowed sort fields and mapping to DB fields
    const allowedSortFields = {
      name: "fullName",
      fullName: "fullName",
      studentCode: "studentCode",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      score: "score",
      phone: "phone",
      status: "status",
    };
    // Validate sortBy
    const safeSortBy = allowedSortFields[sortBy] || "createdAt";
    // Validate sortOrder
    const safeSortOrder = ["asc", "desc"].includes(sortOrder)
      ? sortOrder
      : "asc";

    // Aggregation pipeline for search and pagination
    const matchStage = {};
    if (status) {
      matchStage.academicStatus = status;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "courses",
          localField: "enrolledCourses",
          foreignField: "_id",
          as: "enrolledCoursesData",
        },
      },
    ];

    if (search) {
      const regex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { studentCode: { $regex: regex } },
            { fullName: { $regex: regex } },
            { email: { $regex: regex } },
          ],
        },
      });
    }

    // Sorting
    pipeline.push({
      $sort: { [safeSortBy]: safeSortOrder === "desc" ? -1 : 1 },
    });

    // Pagination
    pipeline.push({ $skip: (page - 1) * parseInt(pageSize) });
    pipeline.push({ $limit: parseInt(pageSize) });

    // Projection
    pipeline.push({
      $project: {
        _id: 1,
        studentCode: 1,
        fullName: 1,
        phone: 1,
        email: 1,
        avatar: 1,
        status: 1,
        dateOfBirth: 1,
        gender: 1,
        address: 1,
        contactInfo: 1,
        contactPerson: 1,
        academicStatus: 1,
        createdAt: 1,
        enrolledCourses: "$enrolledCoursesData",
      },
    });

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.pop(); // remove $limit
    countPipeline.pop(); // remove $skip
    countPipeline.push({ $count: "total" });
    const totalResult = await Student.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Execute aggregation
    const students = await Student.aggregate(pipeline);
    paginatedResponse(
      res,
      students,
      page,
      pageSize,
      total,
      "Lấy danh sách học viên thành công"
    );
  } catch (error) {
    console.error("Get All Students Error:", error);
    errorResponse(res, error.message, 500);
  }
};
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("enrolledCourses")
      .populate({
        path: "attendance",
        populate: { path: "class", select: "className courseCode" },
      })
      .populate({
        path: "financialRecords",
        populate: { path: "course", select: "name courseCode" },
      });

    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    successResponse(res, student, "Lấy thông tin học viên thành công");
  } catch (error) {
    console.error("Get Student Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Private (director, enrollment staff)
 */
exports.createStudent = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      dateOfBirth,
      gender,
      address,
      contactPerson,
    } = req.body;

    // Validate required fields
    if (!password || !fullName || !phone || !dateOfBirth || !gender) {
      return errorResponse(res, "Vui lòng điền đầy đủ thông tin bắt buộc", 400);
    }

    // Check if phone exists
    const existingStudent = await Student.findOne({ phone });
    if (existingStudent) {
      return errorResponse(res, "Số điện thoại đã được sử dụng", 400);
    }

    // Create student
    const student = await Student.create({
      email,
      password,
      fullName,
      phone,
      dateOfBirth,
      gender,
      address,
      contactInfo: {
        phone,
        email,
      },
      contactPerson,
    });

    successResponse(res, student, "Tạo học viên thành công", 201);

    // Optional: notify accountants/directors about new student registration
    try {
      const accountants = await Staff.find({ staffType: "accountant" }).select(
        "_id"
      );
      if (accountants.length > 0) {
        const notis = accountants.map((acc) => ({
          recipient: acc._id,
          type: "system",
          title: "Học viên mới đăng ký",
          message: `Học viên ${student.fullName} đã được tạo trong hệ thống. Vui lòng kiểm tra thông tin và công nợ nếu cần.`,
          relatedModel: "Student",
          relatedId: student._id,
          isRead: false,
          createdAt: new Date(),
        }));
        await Notification.insertMany(notis);
        console.log("🔔 Đã gửi thông báo về học viên mới cho kế toán.");
      }
    } catch (err) {
      console.error("Lỗi gửi noti khi tạo học viên:", err);
    }
  } catch (error) {
    console.error("Create Student Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private (director, staff, self)
 */
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    // Update fields
    const allowedFields = [
      "fullName",
      "phone",
      "email",
      "avatar",
      "dateOfBirth",
      "gender",
      "address",
      "contactPerson",
      "academicStatus",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    successResponse(res, student, "Cập nhật học viên thành công");
  } catch (error) {
    console.error("Update Student Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private (director only)
 */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    await student.deleteOne();

    successResponse(res, null, "Xóa học viên thành công");
  } catch (error) {
    console.error("Delete Student Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get student's courses
 * @route   GET /api/students/:id/courses
 * @access  Private
 */
exports.getStudentCourses = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate({
      path: "enrolledCourses",
      populate: {
        path: "classes",
        select: "className schedule teacher",
        populate: { path: "teacher", select: "teacherCode" },
      },
    });

    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    successResponse(
      res,
      student.enrolledCourses,
      "Lấy danh sách khóa học thành công"
    );
  } catch (error) {
    console.error("Get Student Courses Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Enroll student in course
 * @route   POST /api/students/:id/enroll
 * @access  Private (director, enrollment staff)
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return errorResponse(res, "Course ID là bắt buộc", 400);
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    // Check if already enrolled
    if (!student.canEnrollCourse(courseId)) {
      return errorResponse(res, "Học viên đã đăng ký khóa học này", 400);
    }

    // Check if course exists
    let course;
    try {
      course = await require("../../shared/models/Course.model").findById(
        courseId
      );
    } catch (err) {
      if (err.name === "CastError") {
        return errorResponse(res, "Mã khóa học không hợp lệ", 400);
      }
      throw err;
    }
    if (!course) {
      return errorResponse(res, "Không tìm thấy khóa học", 404);
    }

    // Add course to enrolled courses
    student.enrolledCourses.push(courseId);
    await student.save();

    await student.populate("enrolledCourses", "name courseCode level fee");
    successResponse(res, student, "Ghi danh thành công");

    // --- TRIGGER NOTIFICATION FOR ACCOUNTANT ---
    try {
      const accountants = await Staff.find({ staffType: "accountant" }).select(
        "_id"
      );
      if (accountants.length > 0) {
        const notis = accountants.map((acc) => ({
          recipient: acc._id,
          type: "system",
          title: "Đăng ký khóa học mới",
          message: `Học viên ${student.fullName} vừa đăng ký khóa học ${
            course?.name || ""
          }. Vui lòng kiểm tra công nợ.`,
          relatedModel: "Student",
          relatedId: student._id,
          isRead: false,
          createdAt: new Date(),
        }));

        await Notification.insertMany(notis);
        console.log("🔔 Đã gửi thông báo cho kế toán.");
      }
    } catch (notiError) {
      console.error(
        "Lỗi gửi thông báo kế toán (không ảnh hưởng luồng chính):",
        notiError
      );
    }
  } catch (error) {
    console.error("Enroll Course Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * ===== STUDENT SELF-SERVICE FUNCTIONS =====
 */

/**
 * @desc    Get my courses (for current logged-in student)
 * @route   GET /api/students/me/courses
 * @access  Private (student only)
 */
exports.getMyCourses = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Find classes where student is active
    const enrolledClasses = await Class.find({
      "students.student": studentId,
      "students.status": "active",
    })
      .populate("course", "name code duration")
      .populate("teacher", "fullName")
      .lean();

    if (!enrolledClasses || enrolledClasses.length === 0) {
      return successResponse(res, [], "Chưa đăng ký khóa học nào");
    }

    const coursesWithStats = await Promise.all(
      enrolledClasses.map(async (cls) => {
        // 1. TÍNH TIẾN ĐỘ (PROGRESS) - Kẹp giá trị từ 0-100
        const now = new Date();
        const startDate = cls.startDate ? new Date(cls.startDate) : null;
        const endDate = cls.endDate ? new Date(cls.endDate) : null;

        let progress = 0;
        if (startDate && endDate) {
          if (now < startDate) progress = 0;
          else if (now > endDate) progress = 100;
          else {
            const totalDuration = endDate - startDate;
            const elapsed = now - startDate;
            progress = Math.round((elapsed / totalDuration) * 100);
          }
        }
        // Ensure progress is between 0 and 100
        progress = Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0));

        // 2. TÍNH CHUYÊN CẦN (ATTENDANCE)
        const presentCount = await Attendance.countDocuments({
          class: cls._id,
          student: studentId,
          status: "present", // Hoặc trạng thái được coi là có mặt
        });
        const totalCheckins = await Attendance.countDocuments({
          class: cls._id,
          student: studentId,
        });

        // Display logic: If there are no attendance records, default to 100% (to avoid showing alarming 0%)
        // Frontend can interpret 100 as 'no data' styling if desired, or you can change to null to explicitly denote missing data.
        const attendanceRate = totalCheckins > 0 ? Math.round((presentCount / totalCheckins) * 100) : 100;

        // 3. ĐIỂM SỐ (GRADE)
        const grade = await Grade.findOne({ student: studentId, class: cls._id }).lean();

        // Determine status: Prefer student's enrollment status, fallback to class status
        // Map 'ongoing' class status to 'active' for frontend compatibility if needed
        const enrollment = cls.students.find(s => s.student.toString() === studentId.toString());
        let status = enrollment?.status || cls.status;
        if (status === "ongoing") status = "active";

        return {
          classId: cls._id,
          className: cls.name,
          courseName: cls.course?.name || "Khóa học",
          courseCode: cls.course?.code,
          teacherName: cls.teacher?.fullName || "Giảng viên",
          startDate: cls.startDate,
          endDate: cls.endDate,
          schedule: cls.schedule || [], // Mảng lịch học

          progress,
          attendanceRate,
          averageGrade: grade?.totalScore || 0,
          letterGrade: grade?.letterGrade || "N/A", // Frontend may render N/A as muted

          status: status,
        };
      })
    );

    return successResponse(res, coursesWithStats, "Lấy danh sách khóa học thành công");
  } catch (error) {
    console.error("Get My Courses Error:", error);
    return errorResponse(res, error.message, 500);
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .select("-password -refreshToken")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin học viên",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tải thông tin học viên",
    });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể tải dữ liệu điểm danh",
    });
  }
};

exports.getMyGrades = async (req, res) => {
  try {
    const Grade = require("../../shared/models/Grade.model");

    // Use the Grade static helper to fetch published transcript entries
    const grades = await Grade.getStudentTranscript(req.user._id);

    // Debug logging to help trace why students may see empty results
    try {
      console.log(
        `[student.getMyGrades] userId=${
          req.user && (req.user._id || req.user.id)
        } -> grades found=`,
        Array.isArray(grades) ? grades.length : 0
      );
    } catch (logErr) {
      console.warn("[student.getMyGrades] logging failed:", logErr.message);
    }

    res.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    console.error("Error fetching my grades:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tải dữ liệu điểm số",
    });
  }
};

exports.getMyTuition = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể tải thông tin học phí",
    });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const Request = require("../../shared/models/Request.model");

    const requests = await Request.find({ student: req.user._id })
      .populate("class", "name classCode")
      .populate("targetClass", "name classCode")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tải yêu cầu",
    });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const {
      type,
      title,
      content,
      course: courseId,
      courseId: courseIdAlias,
      class: classId,
      classId: classIdAlias,
      targetClass,
      date,
      startDate,
      endDate,
      reason,
      documents,
      priority,
      phone,
      preferredDate,
      note,
    } = req.body;

    const studentId = req.user && (req.user._id || req.user.id);

    console.log("[student.createRequest] payload:", req.body);
    console.log("[student.createRequest] auth user:", studentId);

    // Normalize identifiers (accept course or courseId, class or classId)
    const finalCourseId = courseId || courseIdAlias || null;
    const finalClassId = classId || classIdAlias || null;

    if (!studentId || !type) {
      return errorResponse(res, "Loại yêu cầu là bắt buộc", 400);
    }

    // If this type requires reason and none provided, reject early
    const needReason = [
      "leave",
      "makeup",
      "transfer",
      "pause",
      "resume",
      "withdrawal",
      "course_enrollment",
      "reserve",
    ];
    const finalReason = reason || content || note || undefined;
    if (needReason.includes(type) && (!finalReason || !finalReason.trim())) {
      return errorResponse(
        res,
        "Vui lòng cung cấp lý do hoặc nội dung yêu cầu",
        400
      );
    }

    // Validate IDs if provided
    if (finalClassId) {
      if (!mongoose.Types.ObjectId.isValid(finalClassId)) {
        return errorResponse(res, "Mã lớp không hợp lệ", 400);
      }
      const ClassModel = require("../../shared/models/Class.model");
      const c = await ClassModel.findById(finalClassId);
      if (!c) return errorResponse(res, "Lớp học không tồn tại", 404);
    }

    if (type === "transfer" && targetClass) {
      if (!mongoose.Types.ObjectId.isValid(targetClass)) {
        return errorResponse(res, "Mã lớp đích không hợp lệ", 400);
      }
      const ClassModel = require("../../shared/models/Class.model");
      const tc = await ClassModel.findById(targetClass);
      if (!tc) return errorResponse(res, "Lớp đích không tồn tại", 404);
    }

    // For course enrollment, ensure course provided
    if (type === "course_enrollment" && !finalCourseId) {
      return errorResponse(
        res,
        "Mã khóa học là bắt buộc khi đăng ký khóa học",
        400
      );
    }

    const RequestModel = require("../../shared/models/Request.model");

    const newReq = await RequestModel.create({
      student: studentId,
      type,
      title: title || getTitleByType(type),
      content: content || undefined,
      reason: finalReason,
      course: finalCourseId || undefined,
      class: finalClassId || undefined,
      targetClass,
      startDate: date
        ? new Date(date)
        : startDate
        ? new Date(startDate)
        : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      documents,
      priority: priority || "normal",
      // consultation-specific fields
      contactPhone: phone,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      additionalNote: note,
    });

    const populated = await RequestModel.findById(newReq._id)
      .populate("student", "studentCode fullName")
      .populate("class", "className classCode")
      .populate("targetClass", "className classCode");

    // Notification logic for various request types
    try {
      const Staff = require("../../shared/models/Staff.model");
      const Notification = require("../../shared/models/Notification.model");

      let targetRoles = [];
      let notiTitle = "Yêu cầu mới";
      let notiMessage = `${populated.student?.fullName || "Học viên"} vừa gửi yêu cầu.`;

      if (type === "consultation") {
        targetRoles = ["enrollment", "academic", "director"];
        notiTitle = "Yêu cầu tư vấn mới";
        notiMessage = `${populated.student?.fullName || "Học viên"} đã gửi yêu cầu tư vấn. SĐT: ${phone || "N/A"}`;
      } else if (type === "course_enrollment") {
        targetRoles = ["enrollment", "academic", "accountant", "director"];
        notiTitle = "Đăng ký khóa học mới";
        notiMessage = `${populated.student?.fullName || "Học viên"} vừa đăng ký khóa học. Vui lòng kiểm tra và thu phí.`;
      } else {
        targetRoles = ["academic", "director"];
        notiTitle = "Yêu cầu học vụ mới";
        notiMessage = `${populated.student?.fullName || "Học viên"} gửi yêu cầu: ${populated.title || populated.reason || "(không có mô tả)"}`;
      }

      const staffUsers = await Staff.find({
        staffType: { $in: targetRoles },
        status: "active",
      }).select("_id");

      if (staffUsers && staffUsers.length > 0) {
        const notifications = staffUsers.map((s) => ({
          recipient: s._id,
          sender: studentId,
          type: "request_response",
          title: notiTitle,
          message: notiMessage,
          link: "/staff/enrollment/requests",
          relatedModel: "Request",
          relatedId: newReq._id,
          isRead: false,
          createdAt: new Date(),
        }));

        await Notification.insertMany(notifications);
        console.log(`🔔 Đã gửi thông báo đến ${notifications.length} nhân viên (Roles: ${targetRoles.join(", ")})`);
      }
    } catch (notifErr) {
      console.error("Lỗi gửi thông báo (không chặn luồng chính):", notifErr);
    }

    successResponse(res, populated, "Tạo yêu cầu thành công", 201);
  } catch (error) {
    console.error("Student createRequest error:", error);
    const isClientError =
      error.name === "ValidationError" ||
      /required|Start date must be before end date|Target class is required/i.test(
        error.message
      );
    if (isClientError) return errorResponse(res, error.message, 400);
    errorResponse(res, error.message, 500);
  }
};

// Helper function to generate a default title
function getTitleByType(type) {
  const map = {
    consultation: "Đăng ký tư vấn",
    leave: "Xin nghỉ phép",
    makeup: "Đăng ký học bù",
    transfer: "Xin chuyển lớp",
    reserve: "Xin bảo lưu",
    course_enrollment: "Đăng ký khóa học",
  };
  return map[type] || "Yêu cầu khác";
}

exports.uploadAvatar = async (req, res) => {
  try {
    console.log("=== AVATAR UPLOAD DEBUG ===");
    console.log("req.user:", req.user);
    console.log("req.userType:", req.userType);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn file ảnh",
      });
    }

    if (!req.user || !req.user._id) {
      console.error("No user or user ID:", {
        user: !!req.user,
        userId: req.user?._id,
      });
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    console.log("Avatar path:", avatarPath);
    console.log("User ID:", req.user._id);
    console.log("User ID type:", typeof req.user._id);

    // Try to find and update in Student model first
    let student = await Student.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    );

    console.log("Student found:", !!student);

    // If not found in Student, try Staff model
    if (!student) {
      try {
        const Staff = require("../../../shared/models/Staff.model");
        console.log("Trying Staff model...");
        student = await Staff.findByIdAndUpdate(
          req.user._id,
          { avatar: avatarPath },
          { new: true }
        );
        console.log("Staff found:", !!student);
      } catch (staffError) {
        console.error("Error updating Staff:", staffError.message);
      }
    }

    if (!student) {
      console.warn("User not found in Student or Staff collection");
      console.warn("Searched with ID:", req.user._id);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      data: student,
      message: "Cập nhật ảnh đại diện thành công",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tải lên ảnh: " + error.message,
    });
  }
};

/**
 * @desc    Get my enrolled classes with schedules
 * @route   GET /api/students/me/classes
 * @access  Private (student)
 */
exports.getMyEnrolledClasses = async (req, res) => {
  try {
    // Get student info to find enrolled classes
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy học viên",
      });
    }

    // Find all classes where student is enrolled
    const classes = await Class.find({
      "students.student": req.user._id,
      "students.status": "active",
    })
      .populate("teacher", "fullName email phone")
      .populate("course", "courseName code")
      .select(
        "name classCode schedule room startDate endDate status teacher course students capacity"
      );

    // Format response with schedule info
    const formattedClasses = classes.map((cls) => ({
      _id: cls._id,
      name: cls.name,
      classCode: cls.classCode,
      room: cls.room,
      status: cls.status,
      schedule: cls.schedule || [],
      teacher: cls.teacher,
      course: cls.course,
      capacity: cls.capacity,
      startDate: cls.startDate,
      endDate: cls.endDate,
      studentCount: cls.students?.length || 0,
    }));

    res.status(200).json({
      success: true,
      data: formattedClasses,
      message: "Lấy danh sách lớp học thành công",
    });
  } catch (error) {
    console.error("Error getting enrolled classes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách lớp học",
      error: error.message,
    });
  }
};
