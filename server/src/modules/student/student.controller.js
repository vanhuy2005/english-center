const Student = require("../../shared/models/Student.model");
const Class = require("../../shared/models/Class.model");
const Grade = require("../../shared/models/Grade.model");
const Attendance = require("../../shared/models/Attendance.model");
const Finance = require("../../shared/models/Finance.model");
const Request = require("../../shared/models/Request.model");
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
    const student = await Student.findById(req.user._id).populate({
      path: "enrolledCourses",
      select: "name courseCode level status",
    });

    if (!student) {
      return errorResponse(res, "Không tìm thấy thông tin học viên", 404);
    }

    // Get classes student is enrolled in
    const classes = await Class.find({ students: student._id })
      .populate("course", "name courseCode")
      .populate("teacher", "firstName lastName")
      .select("className schedule startDate endDate status");

    // If no classes, return enrolled courses without class info
    if (classes.length === 0 && student.enrolledCourses.length > 0) {
      const coursesData = student.enrolledCourses.map(course => ({
        _id: course._id,
        courseName: course.name,
        courseCode: course.courseCode,
        className: "Chưa phân lớp",
        teacherName: null,
        schedule: "Chưa cập nhật",
        status: course.status || "active",
        progress: 0,
        attendanceRate: 0,
        averageGrade: null,
        classId: null,
      }));
      return successResponse(res, coursesData, "Lấy danh sách khóa học thành công");
    }

    // Build course data with class info
    const coursesData = await Promise.all(
      classes.map(async (classInfo) => {
        // Get attendance rate
        const totalSessions = await Attendance.countDocuments({
          class: classInfo._id,
        });
        const presentSessions = await Attendance.countDocuments({
          class: classInfo._id,
          student: student._id,
          status: { $in: ["present", "excused"] },
        });
        const attendanceRate =
          totalSessions > 0
            ? Math.round((presentSessions / totalSessions) * 100)
            : 0;

        // Get average grade
        const grades = await Grade.find({
          class: classInfo._id,
          student: student._id,
        });
        const averageGrade =
          grades.length > 0 && grades[0].finalGrade
            ? grades[0].finalGrade.toFixed(2)
            : null;

        return {
          _id: classInfo._id,
          courseName: classInfo.course?.name || "N/A",
          courseCode: classInfo.course?.courseCode || "N/A",
          className: classInfo.className,
          teacherName: classInfo.teacher
            ? `${classInfo.teacher.firstName} ${classInfo.teacher.lastName}`
            : null,
          schedule: classInfo.schedule || "Chưa cập nhật",
          status: classInfo.status,
          progress: classInfo.progress || 0,
          attendanceRate,
          averageGrade,
          classId: classInfo._id,
        };
      })
    );

    successResponse(res, coursesData, "Lấy danh sách khóa học thành công");
  } catch (error) {
    console.error("Get My Courses Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get my grades (for current logged-in student)
 * @route   GET /api/students/me/grades
 * @access  Private (student only)
 */
exports.getMyGrades = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return errorResponse(res, "Không tìm thấy thông tin học viên", 404);
    }

    // Get all grades for this student
    const grades = await Grade.find({ student: student._id })
      .populate({
        path: "class",
        populate: { path: "course", select: "name courseCode" },
        select: "className",
      })
      .sort({ createdAt: -1 });

    const gradesData = grades.map((grade) => ({
      _id: grade._id,
      courseName: grade.class?.course?.name || "N/A",
      courseCode: grade.class?.course?.courseCode || "N/A",
      className: grade.class?.className || "N/A",
      participation: grade.participation,
      assignment: grade.assignment,
      midterm: grade.midterm,
      finalExam: grade.finalExam,
      finalGrade: grade.finalGrade,
      notes: grade.notes,
      updatedAt: grade.updatedAt,
    }));

    successResponse(res, gradesData, "Lấy kết quả học tập thành công");
  } catch (error) {
    console.error("Get My Grades Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get my attendance (for current logged-in student)
 * @route   GET /api/students/me/attendance
 * @access  Private (student only)
 */
exports.getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return errorResponse(res, "Không tìm thấy thông tin học viên", 404);
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.find({ student: student._id })
      .populate({
        path: "class",
        populate: { path: "course", select: "name courseCode" },
        select: "className",
      })
      .sort({ date: -1 });

    const attendanceData = attendanceRecords.map((record) => ({
      _id: record._id,
      date: record.date,
      courseName: record.class?.course?.name || "N/A",
      className: record.class?.className || "N/A",
      session: record.session,
      status: record.status,
      notes: record.notes,
    }));

    successResponse(res, attendanceData, "Lấy dữ liệu chuyên cần thành công");
  } catch (error) {
    console.error("Get My Attendance Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get my tuition info (for current logged-in student)
 * @route   GET /api/students/me/tuition
 * @access  Private (student only)
 */
exports.getMyTuition = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return errorResponse(res, "Không tìm thấy thông tin học viên", 404);
    }

    // Get all finance records for this student
    const financeRecords = await Finance.find({ student: student._id })
      .populate({
        path: "class",
        populate: { path: "course", select: "name courseCode" },
        select: "className",
      })
      .sort({ createdAt: -1 });

    // Calculate summary
    const total = financeRecords.reduce((sum, r) => sum + r.amount, 0);
    const paid = financeRecords
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + r.amount, 0);
    const remaining = total - paid;
    const overdue = financeRecords
      .filter(
        (r) =>
          r.status === "pending" &&
          r.dueDate &&
          new Date(r.dueDate) < new Date()
      )
      .reduce((sum, r) => sum + r.amount, 0);

    const paymentsData = financeRecords.map((record) => ({
      _id: record._id,
      courseName: record.class?.course?.name || "N/A",
      className: record.class?.className || "N/A",
      period: record.period || "N/A",
      amount: record.amount,
      status: record.status,
      paidDate: record.paidDate,
      dueDate: record.dueDate,
      notes: record.notes,
    }));

    successResponse(
      res,
      {
        summary: { total, paid, remaining, overdue },
        payments: paymentsData,
      },
      "Lấy thông tin học phí thành công"
    );
  } catch (error) {
    console.error("Get My Tuition Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get my requests (for current logged-in student)
 * @route   GET /api/students/me/requests
 * @access  Private (student only)
 */
exports.getMyRequests = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return errorResponse(res, "Không tìm thấy thông tin học viên", 404);
    }

    // Get all requests for this student
    const requests = await Request.find({ student: student._id })
      .populate("class", "className")
      .populate("processedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    const requestsData = requests.map((request) => ({
      _id: request._id,
      type: request.type,
      title: request.title,
      reason: request.reason,
      requestDate: request.requestDate,
      status: request.status,
      courseName: request.courseName || "N/A",
      className: request.class?.className || "N/A",
      response: request.response,
      processedAt: request.processedAt,
      processorName: request.processedBy
        ? `${request.processedBy.firstName} ${request.processedBy.lastName}`
        : null,
      createdAt: request.createdAt,
    }));

    successResponse(res, requestsData, "Lấy danh sách yêu cầu thành công");
  } catch (error) {
    console.error("Get My Requests Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Create new request (for current logged-in student)
 * @route   POST /api/students/me/requests
 * @access  Private (student only)
 */
exports.createRequest = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return errorResponse(res, "Không tìm thấy thông tin học viên", 404);
    }

    const { type, title, reason, requestDate, classId, courseName } = req.body;

    // Validation
    if (!type || !title || !reason) {
      return errorResponse(
        res,
        "Loại yêu cầu, tiêu đề và lý do là bắt buộc",
        400
      );
    }

    const newRequest = new Request({
      student: student._id,
      type,
      title,
      reason,
      requestDate: requestDate || new Date(),
      class: classId || null,
      courseName: courseName || "N/A",
      status: "pending",
    });

    await newRequest.save();

    successResponse(res, newRequest, "Gửi yêu cầu thành công", 201);
  } catch (error) {
    console.error("Create Request Error:", error);
    errorResponse(res, error.message, 500);
  }
};

const fs = require("fs");
const path = require("path");

/**
 * @desc    Upload avatar (for current logged-in student)
 * @route   POST /api/students/me/avatar
 * @access  Private (student only)
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "Vui lòng chọn file ảnh", 400);
    }

    const student = await Student.findById(req.user._id);
    if (!student) {
      return errorResponse(res, "Không tìm thấy thông tin học viên", 404);
    }

    // Delete old avatar if exists
    if (student.avatar) {
      const oldPath = path.join(__dirname, "../../../", student.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new avatar path
    student.avatar = `/uploads/avatars/${req.file.filename}`;
    await student.save();

    successResponse(res, { avatar: student.avatar }, "Tải ảnh đại diện thành công");
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    errorResponse(res, error.message, 500);
  }
};
