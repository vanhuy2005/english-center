const Student = require("../../../shared/models/Student.model");
const User = require("../../../shared/models/User.model");
const Class = require("../../../shared/models/Class.model");
const Course = require("../../../shared/models/Course.model");
const Request = require("../../../shared/models/Request.model");
const Finance = require("../../../shared/models/Finance.model");
const {
  successResponse,
  errorResponse,
} = require("../../../shared/utils/response.util");

/**
 * @desc    Get enrollment staff dashboard stats
 * @route   GET /api/staff/enrollment/dashboard
 * @access  Private (enrollment staff)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all students with enrollment info
    const [
      totalStudents,
      newStudentsThisMonth,
      newStudentsLastMonth,
      activeStudents,
      pendingRequests,
      activeClasses,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Student.countDocuments({
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),
      Student.countDocuments({ academicStatus: "active" }),
      Request.countDocuments({
        status: "pending",
        type: { $in: ["transfer", "pause", "resume"] },
      }),
      Class.countDocuments({ status: { $in: ["active", "upcoming"] } }),
    ]);

    // Calculate growth
    const studentGrowth =
      newStudentsLastMonth > 0
        ? Math.round(
            ((newStudentsThisMonth - newStudentsLastMonth) /
              newStudentsLastMonth) *
              100
          )
        : 0;

    // Get recent students
    const recentStudents = await Student.find()
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get pending enrollment requests
    const pendingEnrollmentRequests = await Request.find({
      status: "pending",
      type: { $in: ["transfer", "pause", "resume"] },
    })
      .populate("student", "studentCode")
      .populate("student.user", "fullName")
      .populate("class", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    successResponse(
      res,
      {
        stats: {
          totalStudents,
          newStudentsThisMonth,
          studentGrowth,
          activeStudents,
          pendingRequests,
          activeClasses,
        },
        recentStudents,
        pendingEnrollmentRequests,
      },
      "Lấy thống kê dashboard thành công"
    );
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Create new student account
 * @route   POST /api/staff/enrollment/students
 * @access  Private (enrollment staff)
 */
exports.createStudent = async (req, res) => {
  const mongoose = require("mongoose");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      fullName,
      phone,
      email,
      dateOfBirth,
      gender,
      address,
      contactInfo,
    } = req.body;

    // Validation
    if (!fullName || !phone) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(
        res,
        "Vui lòng điền đầy đủ họ tên và số điện thoại",
        400
      );
    }

    // Check if phone already exists
    const existingUser = await User.findOne({ phone }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Số điện thoại đã được sử dụng", 400);
    }

    // Check if email exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email }).session(session);
      if (existingEmail) {
        await session.abortTransaction();
        session.endSession();
        return errorResponse(res, "Email đã được sử dụng", 400);
      }
    }

    // Create user account
    const userData = {
      fullName,
      phone,
      email: email || undefined,
      role: "student",
      password: "123456", // Default password
      isFirstLogin: true,
    };

    const userArr = await User.create([userData], { session });
    const user = userArr[0];

    // Create student profile
    const studentProfile = {
      user: user._id,
      fullName: user.fullName,
      email: user.email,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      address: address || undefined,
      contactInfo: contactInfo || undefined,
      academicStatus: "inactive", // Chưa ghi danh khóa học nào
    };

    const studentArr = await Student.create([studentProfile], { session });
    const student = studentArr[0];

    await session.commitTransaction();
    session.endSession();

    successResponse(
      res,
      {
        user: user.getPublicProfile(),
        student,
        defaultPassword: "123456",
      },
      "Tạo tài khoản học viên thành công",
      201
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create Student Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get all students with filters
 * @route   GET /api/staff/enrollment/students
 * @access  Private (enrollment staff)
 */
exports.getAllStudents = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = {};
    if (status) query.academicStatus = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { studentCode: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find(query)
        .populate("user", "fullName email phone")
        .populate("enrolledCourses", "name courseCode")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Student.countDocuments(query),
    ]);

    successResponse(
      res,
      {
        students,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      "Lấy danh sách học viên thành công"
    );
  } catch (error) {
    console.error("Get All Students Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get student by ID
 * @route   GET /api/staff/enrollment/students/:id
 * @access  Private (enrollment staff)
 */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "fullName email phone")
      .populate("enrolledCourses", "name courseCode duration")
      .populate("enrollmentHistory.class", "name startDate endDate");

    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    // Get student's classes with details
    const classes = await Class.find({
      "students.student": student._id,
    })
      .populate("course", "name courseCode")
      .populate("teacher", "fullName");

    // Get financial records
    const financeRecords = await Finance.find({ student: student._id }).sort({
      createdAt: -1,
    });

    successResponse(
      res,
      {
        student,
        classes,
        financeRecords,
      },
      "Lấy thông tin học viên thành công"
    );
  } catch (error) {
    console.error("Get Student By ID Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update student information
 * @route   PUT /api/staff/enrollment/students/:id
 * @access  Private (enrollment staff)
 */
exports.updateStudent = async (req, res) => {
  try {
    const { fullName, email, dateOfBirth, gender, address, contactInfo } =
      req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    // Update fields
    if (fullName) student.fullName = fullName;
    if (email) student.email = email;
    if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);
    if (gender) student.gender = gender;
    if (address) student.address = address;
    if (contactInfo) student.contactInfo = contactInfo;

    await student.save();

    // Update user if needed
    if (fullName || email) {
      await User.findByIdAndUpdate(student.user, {
        ...(fullName && { fullName }),
        ...(email && { email }),
      });
    }

    successResponse(res, student, "Cập nhật thông tin học viên thành công");
  } catch (error) {
    console.error("Update Student Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Enroll student in a class
 * @route   POST /api/staff/enrollment/students/:id/enroll
 * @access  Private (enrollment staff)
 */
exports.enrollStudent = async (req, res) => {
  const mongoose = require("mongoose");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { classId, courseId } = req.body;
    const studentId = req.params.id;

    if (!classId) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Vui lòng chọn lớp học", 400);
    }

    // Get student and class
    const [student, classData] = await Promise.all([
      Student.findById(studentId).session(session),
      Class.findById(classId).populate("course").session(session),
    ]);

    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Không tìm thấy học viên", 404);
    }

    if (!classData) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    // Check if class is full
    const currentEnrollment = classData.students.filter(
      (s) => s.status === "active"
    ).length;
    if (currentEnrollment >= classData.capacity) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Lớp học đã đầy", 400);
    }

    // Check if student already enrolled in this class
    const alreadyEnrolled = classData.students.some(
      (s) => s.student.toString() === studentId && s.status === "active"
    );
    if (alreadyEnrolled) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Học viên đã được ghi danh vào lớp này", 400);
    }

    // Add student to class
    classData.students.push({
      student: studentId,
      enrolledDate: new Date(),
      status: "active",
    });
    await classData.save({ session });

    // Update student profile
    if (!student.enrolledCourses.includes(classData.course._id)) {
      student.enrolledCourses.push(classData.course._id);
    }
    student.academicStatus = "active";
    student.enrollmentHistory.push({
      class: classId,
      course: classData.course._id,
      enrolledDate: new Date(),
      status: "active",
    });
    await student.save({ session });

    // Create finance record for tuition
    await Finance.create(
      [
        {
          student: studentId,
          class: classId,
          type: "tuition",
          amount: classData.course.tuitionFee || 0,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: "pending",
          description: `Học phí khóa ${classData.course.name} - Lớp ${classData.name}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    successResponse(res, { student, class: classData }, "Ghi danh thành công");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Enroll Student Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get all classes with capacity info
 * @route   GET /api/staff/enrollment/classes
 * @access  Private (enrollment staff)
 */
exports.getAllClasses = async (req, res) => {
  try {
    const { status, course, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      if (status.includes(",")) {
        query.status = { $in: status.split(",") };
      } else {
        query.status = status;
      }
    }
    if (course) query.course = course;

    const skip = (page - 1) * limit;
    const [classes, total] = await Promise.all([
      Class.find(query)
        .populate("course", "name courseCode tuitionFee duration")
        .populate("teacher", "fullName")
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Class.countDocuments(query),
    ]);

    // Add capacity info to each class
    const classesWithCapacity = classes.map((cls) => {
      const activeStudents = cls.students.filter(
        (s) => s.status === "active"
      ).length;
      const availableSlots = cls.capacity - activeStudents;
      const percentFull = Math.round((activeStudents / cls.capacity) * 100);

      return {
        ...cls.toObject(),
        currentEnrollment: activeStudents,
        availableSlots,
        percentFull,
        isFull: availableSlots === 0,
      };
    });

    successResponse(
      res,
      {
        classes: classesWithCapacity,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      "Lấy danh sách lớp học thành công"
    );
  } catch (error) {
    console.error("Get All Classes Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get enrollment requests (transfer, pause, resume)
 * @route   GET /api/staff/enrollment/requests
 * @access  Private (enrollment staff)
 */
exports.getEnrollmentRequests = async (req, res) => {
  try {
    const { status = "pending", type, page = 1, limit = 20 } = req.query;

    const query = { status };
    if (type) {
      if (type.includes(",")) {
        query.type = { $in: type.split(",") };
      } else {
        query.type = type;
      }
    } else {
      query.type = { $in: ["transfer", "pause", "resume"] };
    }

    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate("student", "studentCode fullName")
        .populate("student.user", "fullName email phone")
        .populate("class", "name")
        .populate("targetClass", "name")
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
    console.error("Get Enrollment Requests Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Process enrollment request (approve/reject)
 * @route   PUT /api/staff/enrollment/requests/:id
 * @access  Private (enrollment staff)
 */
exports.processRequest = async (req, res) => {
  const mongoose = require("mongoose");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { action, note } = req.body; // action: 'approve' or 'reject'
    const requestId = req.params.id;

    if (!["approve", "reject"].includes(action)) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Hành động không hợp lệ", 400);
    }

    const request = await Request.findById(requestId).session(session);
    if (!request) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Không tìm thấy yêu cầu", 404);
    }

    if (request.status !== "pending") {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Yêu cầu đã được xử lý", 400);
    }

    // Update request status
    request.status = action === "approve" ? "approved" : "rejected";
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    if (note) request.note = note;

    // If approved, update student and class accordingly
    if (action === "approve") {
      const student = await Student.findById(request.student).session(session);
      if (!student) {
        await session.abortTransaction();
        session.endSession();
        return errorResponse(res, "Không tìm thấy học viên", 404);
      }

      if (request.type === "transfer") {
        // Transfer to new class
        const [oldClass, newClass] = await Promise.all([
          Class.findById(request.class).session(session),
          Class.findById(request.targetClass).session(session),
        ]);

        if (oldClass) {
          // Remove from old class
          oldClass.students = oldClass.students.map((s) =>
            s.student.toString() === student._id.toString()
              ? { ...s, status: "dropped" }
              : s
          );
          await oldClass.save({ session });
        }

        if (newClass) {
          // Add to new class
          newClass.students.push({
            student: student._id,
            enrolledDate: new Date(),
            status: "active",
          });
          await newClass.save({ session });
        }
      } else if (request.type === "pause") {
        // Pause enrollment
        student.academicStatus = "paused";
        await student.save({ session });

        const classData = await Class.findById(request.class).session(session);
        if (classData) {
          classData.students = classData.students.map((s) =>
            s.student.toString() === student._id.toString()
              ? { ...s, status: "paused" }
              : s
          );
          await classData.save({ session });
        }
      } else if (request.type === "resume") {
        // Resume enrollment
        student.academicStatus = "active";
        await student.save({ session });

        const classData = await Class.findById(request.class).session(session);
        if (classData) {
          classData.students = classData.students.map((s) =>
            s.student.toString() === student._id.toString()
              ? { ...s, status: "active" }
              : s
          );
          await classData.save({ session });
        }
      }
    }

    await request.save({ session });

    await session.commitTransaction();
    session.endSession();

    successResponse(
      res,
      request,
      `${action === "approve" ? "Phê duyệt" : "Từ chối"} yêu cầu thành công`
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Process Request Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get enrollment statistics
 * @route   GET /api/staff/enrollment/statistics
 * @access  Private (enrollment staff)
 */
exports.getEnrollmentStatistics = async (req, res) => {
  try {
    const { range = "month" } = req.query;

    const now = new Date();
    let startDate, previousStartDate, previousEndDate;

    // Calculate date ranges based on selected period
    switch (range) {
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        previousStartDate = new Date(
          now.getFullYear(),
          (currentQuarter - 1) * 3,
          1
        );
        previousEndDate = new Date(now.getFullYear(), currentQuarter * 3, 0);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    // Get enrollment trends for the last 6 periods
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    const enrollmentTrends = [];

    for (let i = 5; i >= 0; i--) {
      const month = (now.getMonth() - i + 12) % 12;
      const year =
        month > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const count = await Student.countDocuments({
        createdAt: { $gte: firstDay, $lte: lastDay },
      });

      enrollmentTrends.push({
        month: `${months[month]} ${year}`,
        count,
      });
    }

    // Get course popularity
    const coursePopularity = await Student.aggregate([
      { $unwind: "$enrolledCourses" },
      {
        $group: {
          _id: "$enrolledCourses",
          studentCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $project: {
          courseName: "$course.name",
          studentCount: 1,
        },
      },
      { $sort: { studentCount: -1 } },
      { $limit: 5 },
    ]);

    // Get student status distribution
    const studentStatusCounts = await Student.aggregate([
      {
        $group: {
          _id: "$academicStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const studentStatus = {};
    studentStatusCounts.forEach((item) => {
      studentStatus[item._id] = item.count;
    });

    // Get request statistics
    const requestTypes = ["transfer", "pause", "resume", "dropout"];
    const requestStats = {};

    for (const type of requestTypes) {
      const [pending, approved, rejected] = await Promise.all([
        Request.countDocuments({ type, status: "pending" }),
        Request.countDocuments({ type, status: "approved" }),
        Request.countDocuments({ type, status: "rejected" }),
      ]);

      requestStats[type] = { pending, approved, rejected };
    }

    // Get key metrics
    const [
      totalStudents,
      newStudentsThisMonth,
      newStudentsLastMonth,
      pendingRequests,
      activeClasses,
      totalClassCapacity,
      totalEnrolled,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ createdAt: { $gte: startDate } }),
      Student.countDocuments({
        createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      }),
      Request.countDocuments({ status: "pending" }),
      Class.countDocuments({ status: "active" }),
      Class.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: null, total: { $sum: "$capacity" } } },
      ]).then((result) => result[0]?.total || 0),
      Class.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: null, total: { $sum: { $size: "$students" } } } },
      ]).then((result) => result[0]?.total || 0),
    ]);

    // Calculate changes
    const enrollmentChange =
      newStudentsLastMonth > 0
        ? Math.round(
            ((newStudentsThisMonth - newStudentsLastMonth) /
              newStudentsLastMonth) *
              100
          )
        : 0;

    const retentionRate =
      totalStudents > 0
        ? Math.round((studentStatus.active / totalStudents) * 100)
        : 0;

    const classCapacityRate =
      totalClassCapacity > 0
        ? Math.round((totalEnrolled / totalClassCapacity) * 100)
        : 0;

    // Get average request processing time
    const processedRequests = await Request.find({
      status: { $in: ["approved", "rejected"] },
      processedDate: { $exists: true },
    }).select("createdAt processedDate");

    let totalProcessingTime = 0;
    processedRequests.forEach((req) => {
      const diff = (req.processedDate - req.createdAt) / (1000 * 60 * 60); // hours
      totalProcessingTime += diff;
    });

    const avgRequestProcessingTime =
      processedRequests.length > 0
        ? Math.round(totalProcessingTime / processedRequests.length)
        : 0;

    successResponse(
      res,
      {
        enrollmentTrends,
        coursePopularity,
        studentStatus,
        requestStats,
        totalStudents,
        newStudentsThisMonth,
        pendingRequests,
        activeClasses,
        averageClassSize:
          activeClasses > 0 ? Math.round(totalEnrolled / activeClasses) : 0,
        newEnrollments: newStudentsThisMonth,
        enrollmentChange,
        retentionRate,
        retentionChange: 0, // TODO: Calculate from historical data
        avgRequestProcessingTime,
        processingTimeChange: 0, // TODO: Calculate from historical data
        classCapacityRate,
        capacityRateChange: 0, // TODO: Calculate from historical data
      },
      "Lấy thống kê thành công"
    );
  } catch (error) {
    console.error("Get Statistics Error:", error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = exports;
