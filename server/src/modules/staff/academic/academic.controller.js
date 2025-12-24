const Class = require("../../../shared/models/Class.model");
const Student = require("../../../shared/models/Student.model");
const Attendance = require("../../../shared/models/Attendance.model");
const Grade = require("../../../shared/models/Grade.model");
const Request = require("../../../shared/models/Request.model");
const ApiResponse = require("../../../shared/utils/ApiResponse");

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalClasses = await Class.countDocuments({
      status: { $in: ["ongoing", "upcoming"] },
    });
    const totalStudents = await Student.countDocuments({
      academicStatus: "active",
    });

    const pendingRequestsCount = await Request.countDocuments({
      status: "pending",
    });

    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const totalAttendance = attendanceStats.reduce(
      (sum, s) => sum + s.count,
      0
    );
    const presentCount =
      attendanceStats.find((s) => s._id === "present")?.count || 0;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    const gradeStats = await Grade.aggregate([
      { $match: { totalScore: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: "$totalScore" } } },
    ]);
    const averageGrade = gradeStats[0]?.avgScore || 0;

    const recentClasses = await Class.find({ status: "ongoing" })
      .limit(5)
      .populate("course", "name")
      .populate("teacher", "fullName")
      .lean();

    const pendingRequests = await Request.find({ status: "pending" })
      .limit(5)
      .populate("student", "fullName studentCode")
      .populate("class", "name classCode")
      .sort({ createdAt: -1 })
      .lean();

    const dashboardData = {
      stats: {
        totalClasses,
        totalStudents,
        attendanceRate,
        averageGrade: Math.round(averageGrade * 10) / 10,
        pendingRequests: pendingRequestsCount,
        lowAttendanceStudents: 0,
      },
      recentClasses: recentClasses.map((c) => ({
        ...c,
        studentsCount:
          c.students?.filter((s) => s.status === "active").length || 0,
        attendanceRate: 85,
      })),
      pendingRequests,
      attendanceTrend: {
        labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
        datasets: [
          {
            label: "Tỉ lệ chuyên cần (%)",
            data: [82, 85, 83, 87, 86, 85, 88],
            borderColor: "rgb(59, 151, 151)",
            backgroundColor: "rgba(59, 151, 151, 0.1)",
          },
        ],
      },
      gradeDistribution: {
        labels: ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"],
        datasets: [
          {
            data: [15, 30, 35, 15, 5],
            backgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(251, 191, 36, 0.8)",
              "rgba(249, 115, 22, 0.8)",
              "rgba(239, 68, 68, 0.8)",
            ],
          },
        ],
      },
      classPerformance: {
        labels: recentClasses.slice(0, 5).map((c) => c.classCode || c.name),
        datasets: [
          {
            label: "Điểm TB",
            data: [8.2, 7.8, 8.5, 7.2, 8.0],
            backgroundColor: "rgba(59, 151, 151, 0.8)",
          },
        ],
      },
    };

    return ApiResponse.success(
      res,
      dashboardData,
      "Lấy dữ liệu dashboard thành công"
    );
  } catch (error) {
    console.error("Get dashboard error:", error);
    return ApiResponse.error(res, "Không thể lấy dữ liệu dashboard");
  }
};

// Statistics (used by AcademicStatisticsPage)
exports.getStatistics = async (req, res) => {
  try {
    const totalClasses = await Class.countDocuments({
      status: { $in: ["ongoing", "upcoming"] },
    });

    const totalStudents = await Student.countDocuments({
      academicStatus: "active",
    });

    // Overall Attendance Rate
    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const totalAttendance = attendanceStats.reduce(
      (sum, s) => sum + s.count,
      0
    );
    const presentCount =
      attendanceStats.find((s) => s._id === "present")?.count || 0;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    // Average Grade
    const gradeStats = await Grade.aggregate([
      { $match: { totalScore: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: "$totalScore" } } },
    ]);
    const averageGrade = gradeStats[0]?.avgScore || 0;

    // 1. Attendance Trend (Last 7 Days)
    const last7Days = [];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      last7Days.push(dateStr);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }

    const attendanceTrendRaw = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
    ]);

    const attendanceTrendData = last7Days.map((date) => {
      const dayStat = attendanceTrendRaw.find((d) => d._id === date);
      if (!dayStat || dayStat.total === 0) return 0;
      return Math.round((dayStat.present / dayStat.total) * 100);
    });

    // 2. Grade Distribution
    const gradeDistRaw = await Grade.aggregate([
      { $match: { totalScore: { $ne: null } } },
      {
        $bucket: {
          groupBy: "$totalScore",
          boundaries: [0, 5, 6.5, 8, 9, 11], // 0-5 (Yếu), 5-6.5 (TB), 6.5-8 (Khá), 8-9 (Giỏi), 9-11 (XS)
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const distMap = {};
    gradeDistRaw.forEach((b) => (distMap[b._id] = b.count));

    // Order: Xuất sắc, Giỏi, Khá, Trung bình, Yếu
    const gradeDistData = [
      distMap[9] || 0,
      distMap[8] || 0,
      distMap[6.5] || 0,
      distMap[5] || 0,
      distMap[0] || 0,
    ];

    // 3. Enrollment Trend (Last 6 Months)
    const enrollmentTrendRaw = await Student.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const last6Months = [];
    const enrollmentLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
      last6Months.push(monthStr);
      enrollmentLabels.push(`T${d.getMonth() + 1}`);
    }

    const enrollmentData = last6Months.map((month) => {
      const mStat = enrollmentTrendRaw.find((d) => d._id === month);
      return mStat ? mStat.count : 0;
    });

    const data = {
      stats: {
        totalClasses,
        totalStudents,
        attendanceRate,
        averageGrade: Math.round(averageGrade * 10) / 10,
      },
      attendanceTrend: {
        labels: labels,
        datasets: [
          {
            label: "Tỉ lệ chuyên cần (%)",
            data: attendanceTrendData,
            borderColor: "rgb(59, 151, 151)",
            backgroundColor: "rgba(59, 151, 151, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      gradeDistribution: {
        labels: ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"],
        datasets: [
          {
            data: gradeDistData,
            backgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(251, 191, 36, 0.8)",
              "rgba(249, 115, 22, 0.8)",
              "rgba(239, 68, 68, 0.8)",
            ],
          },
        ],
      },
      enrollmentTrend: {
        labels: enrollmentLabels,
        datasets: [
          {
            label: "Học viên mới",
            data: enrollmentData,
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.5)",
          },
        ],
      },
    };

    return ApiResponse.success(res, data, "Lấy thống kê thành công");
  } catch (error) {
    console.error("Get statistics error:", error);
    return ApiResponse.error(res, "Không thể lấy thống kê");
  }
};

// Attendance Management
exports.getAttendance = async (req, res) => {
  try {
    const { classId, date, studentId } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (studentId) filter.student = studentId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(filter)
      .populate("student", "studentCode fullName")
      .populate("class", "classCode name")
      .populate("recordedBy", "fullName")
      .sort({ date: -1 });

    return ApiResponse.success(
      res,
      attendance,
      "Lấy danh sách điểm danh thành công"
    );
  } catch (error) {
    console.error("Get attendance error:", error);
    return ApiResponse.error(res, "Không thể lấy danh sách điểm danh");
  }
};

exports.getAttendanceByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const filter = { class: classId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(filter)
      .populate("student", "studentCode fullName email phone")
      .populate("class", "classCode name")
      .populate("recordedBy", "fullName")
      .sort({ date: -1 });

    return ApiResponse.success(
      res,
      attendance,
      "Lấy danh sách điểm danh theo lớp thành công"
    );
  } catch (error) {
    console.error("Get attendance by class error:", error);
    return ApiResponse.error(res, "Không thể lấy danh sách điểm danh");
  }
};

exports.createAttendance = async (req, res) => {
  try {
    // Validate and sanitize payload to avoid malformed nested objects
    const { student, class: classField, status, note, date } = req.body;

    if (!student) {
      return ApiResponse.error(
        res,
        "Vui lòng cung cấp học viên (student)",
        400
      );
    }
    if (!classField) {
      return ApiResponse.error(res, "Vui lòng cung cấp lớp (class)", 400);
    }

    // If client sent a class object, extract its _id
    const classId =
      typeof classField === "object" && classField !== null
        ? classField._id || classField.id
        : classField;

    const allowed = ["present", "absent", "late", "excused"];
    const finalStatus = allowed.includes(status) ? status : "present";

    const payload = {
      student,
      class: classId,
      status: finalStatus,
      note: note || req.body.notes || "",
      date: date ? new Date(date) : new Date(),
      recordedBy: req.user._id,
    };

    console.log("[createAttendance] payload:", payload);

    // Normalize date to the day range so we search for any attendance
    // record on the same date (regardless of time). Use findOneAndUpdate
    // with upsert to create or update the existing attendance record
    // atomically and avoid duplicate key errors.
    const startOfDay = new Date(payload.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(payload.date);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = {
      student: payload.student,
      class: payload.class,
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    const update = {
      $set: {
        status: payload.status,
        note: payload.note,
        recordedBy: payload.recordedBy,
      },
      $setOnInsert: {
        date: payload.date,
        student: payload.student,
        class: payload.class,
      },
    };

    const options = { new: true, upsert: true, runValidators: true };

    const attendance = await Attendance.findOneAndUpdate(
      filter,
      update,
      options
    )
      .populate("student", "studentCode fullName")
      .populate("class", "classCode name");

    console.log("[createAttendance] upsert result:", attendance);

    return ApiResponse.success(res, attendance, "Điểm danh thành công");
  } catch (error) {
    console.error("Create attendance error:", error);
    // Handle Mongo duplicate key error more explicitly so clients can
    // detect and switch to update flow when attempting to create
    // an attendance record that already exists for student/class/date.
    if (
      error &&
      (error.code === 11000 || /E11000|duplicate/i.test(error.message))
    ) {
      const details = {
        keyValue: error.keyValue || null,
        keyPattern: error.keyPattern || null,
      };
      return ApiResponse.error(res, "Attendance already exists", 409, details);
    }

    return ApiResponse.error(res, error.message || "Không thể điểm danh");
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("student", "studentCode fullName")
      .populate("class", "classCode name");

    if (!attendance) {
      return ApiResponse.notFound(res, "Không tìm thấy bản ghi điểm danh");
    }

    return ApiResponse.success(
      res,
      attendance,
      "Cập nhật điểm danh thành công"
    );
  } catch (error) {
    console.error("Update attendance error:", error);
    return ApiResponse.error(res, "Không thể cập nhật điểm danh");
  }
};

// Grade Management
exports.getGrades = async (req, res) => {
  try {
    const { classId, studentId, isPublished } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (studentId) filter.student = studentId;
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";

    const grades = await Grade.find(filter)
      .populate("student", "studentCode fullName")
      .populate("class", "classCode name")
      .populate("course", "name courseCode")
      .populate("gradedBy", "fullName")
      .sort({ updatedAt: -1 });

    return ApiResponse.success(res, grades, "Lấy danh sách điểm thành công");
  } catch (error) {
    console.error("Get grades error:", error);
    return ApiResponse.error(res, "Không thể lấy danh sách điểm");
  }
};

exports.getGradesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { isPublished } = req.query;
    // Defensive: if classId is not a valid ObjectId, return empty list
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      console.warn("getGradesByClass: invalid classId param:", classId);
      return ApiResponse.success(
        res,
        [],
        "Lớp học không hợp lệ hoặc không có điểm"
      );
    }

    const filter = { class: classId };
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";

    const grades = await Grade.find(filter)
      .populate("student", "studentCode fullName email")
      .populate("class", "classCode name")
      .populate("course", "name courseCode")
      .populate("gradedBy", "fullName")
      .sort({ updatedAt: -1 });

    return ApiResponse.success(
      res,
      grades,
      "Lấy danh sách điểm theo lớp thành công"
    );
  } catch (error) {
    console.error("Get grades by class error:", error);
    // Return empty list on error to avoid sending 400 to the client
    return ApiResponse.success(
      res,
      [],
      "Lấy danh sách điểm theo lớp tạm thời không khả dụng"
    );
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      { ...req.body, gradedBy: req.user._id },
      { new: true, runValidators: true }
    )
      .populate("student", "studentCode fullName")
      .populate("class", "classCode name")
      .populate("course", "name courseCode");

    if (!grade) {
      return ApiResponse.notFound(res, "Không tìm thấy bản ghi điểm");
    }

    return ApiResponse.success(res, grade, "Cập nhật điểm thành công");
  } catch (error) {
    console.error("Update grade error:", error);
    return ApiResponse.error(res, error.message || "Không thể cập nhật điểm");
  }
};

exports.publishGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return ApiResponse.notFound(res, "Không tìm thấy bản ghi điểm");
    }

    // Mark published
    grade.isPublished = true;
    grade.publishedDate = new Date();

    // Ensure gradedBy/gradedDate exist
    if (!grade.gradedBy) grade.gradedBy = req.user._id;
    if (!grade.gradedDate && grade.totalScore !== undefined)
      grade.gradedDate = new Date();

    // If totalScore is present, set status according to pass threshold
    if (grade.totalScore !== undefined && grade.totalScore !== null) {
      grade.status = grade.totalScore >= 60 ? "completed" : "failed";
    } else if (
      grade.scores &&
      (grade.scores.final !== undefined || grade.scores.midterm !== undefined)
    ) {
      // If component scores exist, attempt to compute completion
      // (pre-save will compute totalScore and may update status)
    }

    await grade.save();

    const populated = await Grade.findById(grade._id).populate(
      "student",
      "studentCode fullName email"
    );

    // TODO: Send notification to student

    return ApiResponse.success(res, populated, "Công bố điểm thành công");
  } catch (error) {
    console.error("Publish grade error:", error);
    return ApiResponse.error(res, "Không thể công bố điểm");
  }
};

// Request Management
exports.getRequests = async (req, res) => {
  try {
    const { status, type, studentId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (studentId) filter.student = studentId;

    const requests = await Request.find(filter)
      .populate("student", "studentCode fullName phone email")
      .populate("class", "classCode name")
      .populate("targetClass", "classCode name")
      .populate("course", "name courseCode")
      .populate("processedBy", "fullName")
      .sort({ createdAt: -1 });

    return ApiResponse.success(
      res,
      requests,
      "Lấy danh sách yêu cầu thành công"
    );
  } catch (error) {
    console.error("Get requests error:", error);
    return ApiResponse.error(res, "Không thể lấy danh sách yêu cầu");
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { responseNote } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return ApiResponse.notFound(res, "Không tìm thấy yêu cầu");
    }

    await request.approve(req.user._id, responseNote);

    const populated = await Request.findById(request._id)
      .populate("student", "studentCode fullName email")
      .populate("class", "classCode name")
      .populate("processedBy", "fullName");

    // TODO: Send notification to student

    return ApiResponse.success(res, populated, "Duyệt yêu cầu thành công");
  } catch (error) {
    console.error("Approve request error:", error);
    return ApiResponse.error(res, "Không thể duyệt yêu cầu");
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { rejectionReason, responseNote } = req.body;

    if (!rejectionReason) {
      return ApiResponse.error(res, "Vui lòng nhập lý do từ chối", 400);
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return ApiResponse.notFound(res, "Không tìm thấy yêu cầu");
    }

    await request.reject(req.user._id, rejectionReason, responseNote);

    const populated = await Request.findById(request._id)
      .populate("student", "studentCode fullName email")
      .populate("class", "classCode name")
      .populate("processedBy", "fullName");

    // TODO: Send notification to student

    return ApiResponse.success(res, populated, "Từ chối yêu cầu thành công");
  } catch (error) {
    console.error("Reject request error:", error);
    return ApiResponse.error(res, "Không thể từ chối yêu cầu");
  }
};

// Student Management
exports.getStudents = async (req, res) => {
  try {
    const { academicStatus, search } = req.query;
    const matchStage = {};

    if (academicStatus) matchStage.academicStatus = academicStatus;
    if (search) {
      matchStage.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { studentCode: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      // Lookup Grades
      {
        $lookup: {
          from: "grades",
          localField: "_id",
          foreignField: "student",
          as: "grades",
        },
      },
      // Lookup Attendance
      {
        $lookup: {
          from: "attendances",
          localField: "_id",
          foreignField: "student",
          as: "attendances",
        },
      },
      // Add computed fields
      {
        $addFields: {
          average: {
            $avg: "$grades.totalScore",
          },
          attendanceRate: {
            $cond: {
              if: { $eq: [{ $size: "$attendances" }, 0] },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: "$attendances",
                            as: "att",
                            cond: { $eq: ["$$att.status", "present"] },
                          },
                        },
                      },
                      { $size: "$attendances" },
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
      },
      // Project to remove heavy arrays and sensitive info
      {
        $project: {
          password: 0,
          refreshToken: 0,
          grades: 0,
          attendances: 0,
        },
      },
    ]);

    return ApiResponse.success(
      res,
      students,
      "Lấy danh sách học viên thành công"
    );
  } catch (error) {
    console.error("Get students error:", error);
    return ApiResponse.error(res, "Không thể lấy danh sách học viên");
  }
};

exports.getStudentDetail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .select("-password -refreshToken")
      .populate("enrolledCourses", "name courseCode level");

    if (!student) {
      return ApiResponse.notFound(res, "Không tìm thấy học viên");
    }

    // Get attendance stats
    const attendanceStats = await Attendance.getStudentStats(student._id);

    // Get grades
    const grades = await Grade.find({ student: student._id, isPublished: true })
      .populate("course", "name courseCode")
      .populate("class", "name classCode")
      .sort({ updatedAt: -1 });

    const data = {
      ...student.toObject(),
      attendanceStats,
      grades,
    };

    return ApiResponse.success(res, data, "Lấy thông tin học viên thành công");
  } catch (error) {
    console.error("Get student detail error:", error);
    return ApiResponse.error(res, "Không thể lấy thông tin học viên");
  }
};

// Reports
exports.getClassReport = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId)
      .populate("course", "name courseCode")
      .populate("teacher", "fullName staffCode");

    if (!classData) {
      return ApiResponse.notFound(res, "Không tìm thấy lớp học");
    }

    const { grades, stats } = await Grade.getClassReport(classId);

    const attendanceData = await Attendance.aggregate([
      { $match: { class: classData._id } },
      {
        $group: {
          _id: "$student",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        },
      },
      {
        $project: {
          studentId: "$_id",
          attendanceRate: {
            $multiply: [{ $divide: ["$present", "$total"] }, 100],
          },
        },
      },
    ]);

    const report = {
      class: classData,
      gradeStats: stats,
      grades,
      attendanceData,
    };

    return ApiResponse.success(res, report, "Lấy báo cáo lớp học thành công");
  } catch (error) {
    console.error("Get class report error:", error);
    return ApiResponse.error(res, "Không thể lấy báo cáo lớp học");
  }
};
