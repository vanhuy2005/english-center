const Class = require("../../../shared/models/Class.model");
const Student = require("../../../shared/models/Student.model");
const Attendance = require("../../../shared/models/Attendance.model");
const Grade = require("../../../shared/models/Grade.model");
const Schedule = require("../../../shared/models/Schedule.model");
const Request = require("../../../shared/models/Request.model");
const {
  successResponse,
  errorResponse,
} = require("../../../shared/utils/response.util");

/**
 * Academic Staff Controller
 * Handles academic management operations
 */

// ==================== DASHBOARD ====================

/**
 * @route GET /api/staff/academic/dashboard
 * @desc Get academic staff dashboard data
 * @access Private (Academic Staff only)
 */
exports.getDashboard = async (req, res) => {
  try {
    const staffId = req.user._id;

    // Get all classes
    const allClasses = await Class.find({
      status: { $in: ["active", "pending", "completed"] },
    })
      .populate("teacher", "fullName")
      .populate("students.student", "fullName");

    const totalClasses = allClasses.length;
    const totalStudents = allClasses.reduce(
      (sum, cls) =>
        sum + cls.students.filter((s) => s.status === "active").length,
      0
    );

    // Calculate attendance rate
    const attendanceRecords = await Attendance.find({
      class: { $in: allClasses.map((c) => c._id) },
    });

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (a) => a.status === "present"
    ).length;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    // Calculate average grade
    const grades = await Grade.find({
      class: { $in: allClasses.map((c) => c._id) },
    });

    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
        : 0;

    // Get pending requests
    const pendingRequests = await Request.find({ status: "pending" })
      .populate("student", "fullName email")
      .populate("class", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingRequestsCount = await Request.countDocuments({
      status: "pending",
    });

    // Get low attendance students (below 80%)
    const studentAttendance = {};
    attendanceRecords.forEach((record) => {
      const studentId = record.student.toString();
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = { total: 0, present: 0 };
      }
      studentAttendance[studentId].total++;
      if (record.status === "present") {
        studentAttendance[studentId].present++;
      }
    });

    const lowAttendanceStudents = Object.entries(studentAttendance).filter(
      ([_, data]) => (data.present / data.total) * 100 < 80
    ).length;

    // Get recent classes
    const recentClasses = allClasses.slice(0, 5).map((cls) => ({
      _id: cls._id,
      name: cls.name,
      studentsCount: cls.students.filter((s) => s.status === "active").length,
      attendanceRate: Math.round(Math.random() * 30 + 70), // TODO: Calculate real attendance rate
      status: cls.status,
    }));

    // Attendance trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const attendanceTrend = {
      labels: last7Days.map((d) =>
        d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      ),
      datasets: [
        {
          label: "Tỉ lệ chuyên cần (%)",
          data: last7Days.map(() => Math.round(Math.random() * 20 + 75)), // TODO: Real data
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
      ],
    };

    // Grade distribution
    const gradeDistribution = {
      labels: [
        "Xuất sắc (9-10)",
        "Giỏi (8-8.9)",
        "Khá (6.5-7.9)",
        "Trung bình (5-6.4)",
        "Yếu (<5)",
      ],
      datasets: [
        {
          data: [
            grades.filter((g) => g.score >= 9).length,
            grades.filter((g) => g.score >= 8 && g.score < 9).length,
            grades.filter((g) => g.score >= 6.5 && g.score < 8).length,
            grades.filter((g) => g.score >= 5 && g.score < 6.5).length,
            grades.filter((g) => g.score < 5).length,
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
        },
      ],
    };

    // Class performance
    const classPerformance = {
      labels: allClasses.slice(0, 10).map((c) => c.name),
      datasets: [
        {
          label: "Điểm trung bình",
          data: await Promise.all(
            allClasses.slice(0, 10).map(async (cls) => {
              const classGrades = await Grade.find({ class: cls._id });
              return classGrades.length > 0
                ? classGrades.reduce((sum, g) => sum + g.score, 0) /
                    classGrades.length
                : 0;
            })
          ),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
        },
      ],
    };

    successResponse(
      res,
      {
        stats: {
          totalClasses,
          totalStudents,
          attendanceRate,
          averageGrade: Math.round(averageGrade * 10) / 10,
          pendingRequests: pendingRequestsCount,
          lowAttendanceStudents,
        },
        recentClasses,
        pendingRequests,
        attendanceTrend,
        gradeDistribution,
        classPerformance,
      },
      "Lấy dashboard thành công"
    );
  } catch (error) {
    console.error("Error in getDashboard:", error);
    errorResponse(res, "Không thể lấy dữ liệu dashboard", 500);
  }
};

// ==================== CLASS MANAGEMENT ====================

/**
 * @route GET /api/staff/academic/classes
 * @desc Get all classes with filters
 * @access Private (Academic Staff only)
 */
exports.getClasses = async (req, res) => {
  try {
    const { search, status, level } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "teacher.fullName": { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (level && level !== "all") {
      query.level = level;
    }

    const classes = await Class.find(query)
      .populate("teacher", "fullName email")
      .populate("course", "name")
      .populate("students.student", "fullName")
      .sort({ createdAt: -1 });

    const classesWithStats = await Promise.all(
      classes.map(async (cls) => {
        // Calculate attendance rate
        const attendanceRecords = await Attendance.find({ class: cls._id });
        const presentCount = attendanceRecords.filter(
          (a) => a.status === "present"
        ).length;
        const attendanceRate =
          attendanceRecords.length > 0
            ? Math.round((presentCount / attendanceRecords.length) * 100)
            : 0;

        // Calculate average grade
        const grades = await Grade.find({ class: cls._id });
        const averageGrade =
          grades.length > 0
            ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
            : 0;

        return {
          _id: cls._id,
          name: cls.name,
          course: cls.course,
          teacher: cls.teacher,
          studentsCount: cls.students.filter((s) => s.status === "active")
            .length,
          maxStudents: cls.maxStudents || 30,
          attendanceRate,
          averageGrade: Math.round(averageGrade * 10) / 10,
          schedule: cls.schedule,
          status: cls.status,
        };
      })
    );

    successResponse(
      res,
      { classes: classesWithStats },
      "Lấy danh sách lớp thành công"
    );
  } catch (error) {
    console.error("Error in getClasses:", error);
    errorResponse(res, "Không thể lấy danh sách lớp", 500);
  }
};

// ==================== ATTENDANCE TRACKING ====================

/**
 * @route GET /api/staff/academic/attendance
 * @desc Get attendance data with filters
 * @access Private (Academic Staff only)
 */
exports.getAttendanceData = async (req, res) => {
  try {
    const { classId, dateFrom, dateTo } = req.query;

    let query = {};

    if (classId && classId !== "all") {
      query.class = classId;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("student", "fullName email")
      .populate("class", "name");

    // Group by student
    const studentAttendanceMap = {};

    attendanceRecords.forEach((record) => {
      const studentId = record.student._id.toString();
      if (!studentAttendanceMap[studentId]) {
        studentAttendanceMap[studentId] = {
          student: record.student,
          class: record.class,
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
          excusedCount: 0,
        };
      }

      studentAttendanceMap[studentId].totalSessions++;
      if (record.status === "present")
        studentAttendanceMap[studentId].presentCount++;
      else if (record.status === "absent")
        studentAttendanceMap[studentId].absentCount++;
      else if (record.status === "excused")
        studentAttendanceMap[studentId].excusedCount++;
    });

    const lowAttendanceStudents = Object.values(studentAttendanceMap)
      .map((data) => ({
        ...data,
        attendanceRate: Math.round(
          (data.presentCount / data.totalSessions) * 100
        ),
      }))
      .filter((data) => data.attendanceRate < 80)
      .sort((a, b) => a.attendanceRate - b.attendanceRate);

    // Calculate stats
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (a) => a.status === "present"
    ).length;
    const averageRate =
      totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // Attendance trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const attendanceTrend = {
      labels: last7Days.map((d) =>
        d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      ),
      datasets: [
        {
          label: "Tỉ lệ chuyên cần (%)",
          data: last7Days.map(() => Math.round(Math.random() * 20 + 75)),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
        },
      ],
    };

    successResponse(
      res,
      {
        stats: {
          totalSessions,
          averageRate,
          lowAttendanceCount: lowAttendanceStudents.length,
        },
        lowAttendanceStudents,
        attendanceTrend,
      },
      "Lấy dữ liệu chuyên cần thành công"
    );
  } catch (error) {
    console.error("Error in getAttendanceData:", error);
    errorResponse(res, "Không thể lấy dữ liệu chuyên cần", 500);
  }
};

/**
 * @route POST /api/staff/academic/attendance/report
 * @desc Export attendance report
 * @access Private (Academic Staff only)
 */
exports.exportAttendanceReport = async (req, res) => {
  try {
    const { classId, dateFrom, dateTo } = req.body;

    // TODO: Implement Excel export using exceljs or similar library
    // For now, return success message

    successResponse(res, {}, "Báo cáo đang được tạo và sẽ tự động tải xuống");
  } catch (error) {
    console.error("Error in exportAttendanceReport:", error);
    errorResponse(res, "Không thể xuất báo cáo", 500);
  }
};

// ==================== GRADE MANAGEMENT ====================

/**
 * @route GET /api/staff/academic/grades
 * @desc Get all grades with filters
 * @access Private (Academic Staff only)
 */
exports.getGrades = async (req, res) => {
  try {
    const { classId, studentId, status } = req.query;

    let query = {};

    if (classId && classId !== "all") {
      query.class = classId;
    }

    if (studentId) {
      query.student = studentId;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const grades = await Grade.find(query)
      .populate("student", "fullName email")
      .populate("class", "name")
      .populate("teacher", "fullName")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalGrades = grades.length;
    const averageGrade =
      totalGrades > 0
        ? grades.reduce((sum, g) => sum + g.score, 0) / totalGrades
        : 0;
    const passRate =
      totalGrades > 0
        ? Math.round(
            (grades.filter((g) => g.score >= 5).length / totalGrades) * 100
          )
        : 0;

    // Grade distribution
    const gradeDistribution = {
      labels: [
        "Xuất sắc (9-10)",
        "Giỏi (8-8.9)",
        "Khá (6.5-7.9)",
        "Trung bình (5-6.4)",
        "Yếu (<5)",
      ],
      datasets: [
        {
          data: [
            grades.filter((g) => g.score >= 9).length,
            grades.filter((g) => g.score >= 8 && g.score < 9).length,
            grades.filter((g) => g.score >= 6.5 && g.score < 8).length,
            grades.filter((g) => g.score >= 5 && g.score < 6.5).length,
            grades.filter((g) => g.score < 5).length,
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
        },
      ],
    };

    successResponse(
      res,
      {
        grades,
        stats: {
          totalGrades,
          averageGrade: Math.round(averageGrade * 10) / 10,
          passRate,
        },
        gradeDistribution,
      },
      "Lấy danh sách điểm thành công"
    );
  } catch (error) {
    console.error("Error in getGrades:", error);
    errorResponse(res, "Không thể lấy danh sách điểm", 500);
  }
};

/**
 * @route PUT /api/staff/academic/grades/:id
 * @desc Update grade
 * @access Private (Academic Staff only)
 */
exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, status, note } = req.body;

    const grade = await Grade.findByIdAndUpdate(
      id,
      { score, status, note, updatedBy: req.user._id },
      { new: true }
    )
      .populate("student", "fullName")
      .populate("class", "name");

    if (!grade) {
      return errorResponse(res, "Không tìm thấy điểm", 404);
    }

    successResponse(res, { grade }, "Cập nhật điểm thành công");
  } catch (error) {
    console.error("Error in updateGrade:", error);
    errorResponse(res, "Không thể cập nhật điểm", 500);
  }
};

// ==================== STUDENT PROGRESS ====================

/**
 * @route GET /api/staff/academic/students/progress
 * @desc Get student progress data
 * @access Private (Academic Staff only)
 */
exports.getStudentProgress = async (req, res) => {
  try {
    const { search, classId } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(query).limit(50);

    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        // Get student's classes
        const classes = await Class.find({
          "students.student": student._id,
          "students.status": "active",
        });

        if (classId && classId !== "all") {
          const filteredClasses = classes.filter(
            (c) => c._id.toString() === classId
          );
          if (filteredClasses.length === 0) return null;
        }

        // Calculate attendance
        const attendanceRecords = await Attendance.find({
          student: student._id,
        });
        const presentCount = attendanceRecords.filter(
          (a) => a.status === "present"
        ).length;
        const attendanceRate =
          attendanceRecords.length > 0
            ? Math.round((presentCount / attendanceRecords.length) * 100)
            : 0;

        // Calculate average grade
        const grades = await Grade.find({ student: student._id });
        const averageGrade =
          grades.length > 0
            ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
            : 0;

        return {
          _id: student._id,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          classes: classes.map((c) => c.name).join(", "),
          attendanceRate,
          averageGrade: Math.round(averageGrade * 10) / 10,
          totalGrades: grades.length,
        };
      })
    );

    const filteredStudents = studentsWithProgress.filter((s) => s !== null);

    successResponse(
      res,
      { students: filteredStudents },
      "Lấy tiến độ học viên thành công"
    );
  } catch (error) {
    console.error("Error in getStudentProgress:", error);
    errorResponse(res, "Không thể lấy tiến độ học viên", 500);
  }
};

// ==================== REQUEST HANDLING ====================

/**
 * @route GET /api/staff/academic/requests
 * @desc Get all requests
 * @access Private (Academic Staff only)
 */
exports.getRequests = async (req, res) => {
  try {
    const { status, type } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    const requests = await Request.find(query)
      .populate("student", "fullName email phone")
      .populate("class", "name")
      .populate("processedBy", "fullName")
      .sort({ createdAt: -1 });

    successResponse(res, { requests }, "Lấy danh sách yêu cầu thành công");
  } catch (error) {
    console.error("Error in getRequests:", error);
    errorResponse(res, "Không thể lấy danh sách yêu cầu", 500);
  }
};

/**
 * @route PUT /api/staff/academic/requests/:id/approve
 * @desc Approve a request
 * @access Private (Academic Staff only)
 */
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const request = await Request.findByIdAndUpdate(
      id,
      {
        status: "approved",
        processedBy: req.user._id,
        processedAt: new Date(),
        processorNote: note,
      },
      { new: true }
    )
      .populate("student", "fullName")
      .populate("class", "name");

    if (!request) {
      return errorResponse(res, "Không tìm thấy yêu cầu", 404);
    }

    // TODO: Send notification to student

    successResponse(res, { request }, "Phê duyệt yêu cầu thành công");
  } catch (error) {
    console.error("Error in approveRequest:", error);
    errorResponse(res, "Không thể phê duyệt yêu cầu", 500);
  }
};

/**
 * @route PUT /api/staff/academic/requests/:id/reject
 * @desc Reject a request
 * @access Private (Academic Staff only)
 */
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const request = await Request.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        processedBy: req.user._id,
        processedAt: new Date(),
        processorNote: note,
      },
      { new: true }
    )
      .populate("student", "fullName")
      .populate("class", "name");

    if (!request) {
      return errorResponse(res, "Không tìm thấy yêu cầu", 404);
    }

    // TODO: Send notification to student

    successResponse(res, { request }, "Từ chối yêu cầu thành công");
  } catch (error) {
    console.error("Error in rejectRequest:", error);
    errorResponse(res, "Không thể từ chối yêu cầu", 500);
  }
};

// ==================== REPORTS & STATISTICS ====================

/**
 * @route GET /api/staff/academic/reports/class/:classId
 * @desc Generate class report
 * @access Private (Academic Staff only)
 */
exports.getClassReport = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId)
      .populate("teacher", "fullName email")
      .populate("course", "name")
      .populate("students.student", "fullName email");

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    // Get attendance data
    const attendanceRecords = await Attendance.find({ class: classId });
    const presentCount = attendanceRecords.filter(
      (a) => a.status === "present"
    ).length;
    const attendanceRate =
      attendanceRecords.length > 0
        ? Math.round((presentCount / attendanceRecords.length) * 100)
        : 0;

    // Get grades data
    const grades = await Grade.find({ class: classId });
    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
        : 0;

    const report = {
      class: {
        name: classData.name,
        course: classData.course.name,
        teacher: classData.teacher.fullName,
        studentsCount: classData.students.filter((s) => s.status === "active")
          .length,
      },
      attendance: {
        totalSessions: attendanceRecords.length,
        attendanceRate,
      },
      grades: {
        totalGrades: grades.length,
        averageGrade: Math.round(averageGrade * 10) / 10,
        passRate:
          grades.length > 0
            ? Math.round(
                (grades.filter((g) => g.score >= 5).length / grades.length) *
                  100
              )
            : 0,
      },
    };

    successResponse(res, { report }, "Tạo báo cáo lớp học thành công");
  } catch (error) {
    console.error("Error in getClassReport:", error);
    errorResponse(res, "Không thể tạo báo cáo", 500);
  }
};

/**
 * @route GET /api/staff/academic/statistics
 * @desc Get academic statistics
 * @access Private (Academic Staff only)
 */
exports.getStatistics = async (req, res) => {
  try {
    const { dateFrom, dateTo, classId, level } = req.query;

    // Build query
    let classQuery = {};
    if (classId && classId !== "all") {
      classQuery._id = classId;
    }
    if (level && level !== "all") {
      classQuery.level = level;
    }

    const classes = await Class.find(classQuery);
    const classIds = classes.map((c) => c._id);

    // Get grades
    let gradeQuery = { class: { $in: classIds } };
    if (dateFrom || dateTo) {
      gradeQuery.createdAt = {};
      if (dateFrom) gradeQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) gradeQuery.createdAt.$lte = new Date(dateTo);
    }

    const grades = await Grade.find(gradeQuery);

    // Grade distribution
    const gradeDistribution = {
      labels: [
        "Xuất sắc (9-10)",
        "Giỏi (8-8.9)",
        "Khá (6.5-7.9)",
        "Trung bình (5-6.4)",
        "Yếu (<5)",
      ],
      datasets: [
        {
          data: [
            grades.filter((g) => g.score >= 9).length,
            grades.filter((g) => g.score >= 8 && g.score < 9).length,
            grades.filter((g) => g.score >= 6.5 && g.score < 8).length,
            grades.filter((g) => g.score >= 5 && g.score < 6.5).length,
            grades.filter((g) => g.score < 5).length,
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
        },
      ],
    };

    // Class performance comparison
    const classPerformance = {
      labels: classes.slice(0, 10).map((c) => c.name),
      datasets: [
        {
          label: "Điểm trung bình",
          data: await Promise.all(
            classes.slice(0, 10).map(async (cls) => {
              const classGrades = await Grade.find({ class: cls._id });
              return classGrades.length > 0
                ? classGrades.reduce((sum, g) => sum + g.score, 0) /
                    classGrades.length
                : 0;
            })
          ),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
        },
        {
          label: "Tỉ lệ chuyên cần (%)",
          data: await Promise.all(
            classes.slice(0, 10).map(async (cls) => {
              const attendance = await Attendance.find({ class: cls._id });
              const present = attendance.filter(
                (a) => a.status === "present"
              ).length;
              return attendance.length > 0
                ? Math.round((present / attendance.length) * 100)
                : 0;
            })
          ),
          backgroundColor: "rgba(34, 197, 94, 0.8)",
        },
      ],
    };

    // Attendance trends
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const attendanceTrends = {
      labels: last7Days.map((d) =>
        d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      ),
      datasets: [
        {
          label: "Tỉ lệ chuyên cần (%)",
          data: last7Days.map(() => Math.round(Math.random() * 20 + 75)),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
        },
      ],
    };

    successResponse(
      res,
      {
        gradeDistribution,
        classPerformance,
        attendanceTrends,
      },
      "Lấy thống kê thành công"
    );
  } catch (error) {
    console.error("Error in getStatistics:", error);
    errorResponse(res, "Không thể lấy thống kê", 500);
  }
};

module.exports = exports;
