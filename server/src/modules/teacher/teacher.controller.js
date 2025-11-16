const Class = require("../../shared/models/Class.model");
const Student = require("../../shared/models/Student.model");
const Attendance = require("../../shared/models/Attendance.model");
const Grade = require("../../shared/models/Grade.model");
const Schedule = require("../../shared/models/Schedule.model");
const Notification = require("../../shared/models/Notification.model");
const Staff = require("../../shared/models/Staff.model");
const {
  successResponse,
  errorResponse,
} = require("../../shared/utils/response.util");

/**
 * Get all teachers (for Director/Admin)
 */
exports.getAll = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search } = req.query;
    const skip = (page - 1) * pageSize;

    const query = { staffType: "teacher", status: "active" };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [teachers, total] = await Promise.all([
      Staff.find(query)
        .select("-password")
        .skip(skip)
        .limit(parseInt(pageSize))
        .sort({ createdAt: -1 }),
      Staff.countDocuments(query),
    ]);

    successResponse(
      res,
      {
        teachers,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / pageSize),
        },
      },
      "Lấy danh sách giáo viên thành công"
    );
  } catch (error) {
    console.error("Error in getAll:", error);
    errorResponse(res, "Không thể lấy danh sách giáo viên", 500);
  }
};

/**
 * Get teacher dashboard data
 */
exports.getDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get total classes
    const totalClasses = await Class.countDocuments({ teacher: teacherId });
    const activeClasses = await Class.countDocuments({
      teacher: teacherId,
      status: "active",
    });

    // Get total students across all classes
    const classes = await Class.find({ teacher: teacherId });
    const totalStudents = classes.reduce(
      (sum, c) => sum + c.students.filter((s) => s.status === "active").length,
      0
    );

    // Get this week's sessions
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weekSessions = await Schedule.countDocuments({
      teacher: teacherId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const completedSessions = await Schedule.countDocuments({
      teacher: teacherId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
      status: "completed",
    });

    // Get average grade
    const grades = await Grade.find({
      class: { $in: classes.map((c) => c._id) },
    });
    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
        : 0;

    // Get upcoming classes today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingClasses = await Schedule.find({
      teacher: teacherId,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate("class", "name students")
      .sort({ startTime: 1 })
      .limit(5);

    // Get recent notifications
    const recentNotifications = await Notification.find({
      recipient: teacherId,
      recipientType: "teacher",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get grades by class
    const gradesByClass = await Promise.all(
      classes.slice(0, 5).map(async (classData) => {
        const classGrades = await Grade.find({ class: classData._id });
        const average =
          classGrades.length > 0
            ? classGrades.reduce((sum, g) => sum + g.score, 0) /
              classGrades.length
            : 0;
        return {
          className: classData.name,
          average: parseFloat(average.toFixed(2)),
        };
      })
    );

    // Get attendance trend (mock data for now - can be enhanced)
    const attendanceTrend = [
      { month: "T7", rate: 85 },
      { month: "T8", rate: 88 },
      { month: "T9", rate: 90 },
      { month: "T10", rate: 87 },
      { month: "T11", rate: 92 },
    ];

    successResponse(
      res,
      {
        teacher: req.user,
        stats: {
          totalClasses,
          activeClasses,
          totalStudents,
          weekSessions,
          completedSessions,
          averageGrade: parseFloat(averageGrade.toFixed(2)),
        },
        upcomingClasses,
        recentNotifications,
        gradesByClass,
        attendanceTrend,
      },
      "Lấy dashboard thành công"
    );
  } catch (error) {
    console.error("Error in getDashboard:", error);
    errorResponse(res, "Không thể lấy dữ liệu dashboard", 500);
  }
};

/**
 * Get all classes assigned to the teacher
 */
exports.getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { status } = req.query;

    const query = { teacher: teacherId };
    if (status) {
      query.status = status;
    }

    const classes = await Class.find(query)
      .populate("course", "name description")
      .populate("students.student", "studentId fullName email phoneNumber")
      .sort({ startDate: -1 });

    successResponse(res, { classes }, "Lấy danh sách lớp thành công");
  } catch (error) {
    console.error("Error in getMyClasses:", error);
    errorResponse(res, "Không thể lấy danh sách lớp", 500);
  }
};

/**
 * Get single class details
 */
exports.getClassDetail = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    })
      .populate("course", "name description duration")
      .populate("students.student", "studentId fullName email phoneNumber")
      .populate("teacher", "fullName email");

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    successResponse(res, { class: classData }, "Lấy thông tin lớp thành công");
  } catch (error) {
    console.error("Error in getClassDetail:", error);
    errorResponse(res, "Không thể lấy thông tin lớp", 500);
  }
};

/**
 * Get students in a class
 */
exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    }).populate("students.student", "studentId fullName email phoneNumber");

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    // Calculate stats for each student
    const studentsWithStats = await Promise.all(
      classData.students.map(async (studentRecord) => {
        // Get attendance rate
        const attendanceRecords = await Attendance.find({
          class: classId,
          student: studentRecord.student._id,
        });

        const totalSessions = attendanceRecords.length;
        const presentSessions = attendanceRecords.filter(
          (a) => a.status === "present" || a.status === "late"
        ).length;
        const attendanceRate =
          totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

        // Get average grade
        const grades = await Grade.find({
          class: classId,
          student: studentRecord.student._id,
        });

        let averageGrade = null;
        if (grades.length > 0) {
          const totalWeightedScore = grades.reduce(
            (sum, grade) => sum + grade.score * (grade.weight || 1),
            0
          );
          const totalWeight = grades.reduce(
            (sum, grade) => sum + (grade.weight || 1),
            0
          );
          averageGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
        }

        return {
          ...studentRecord.toObject(),
          attendanceRate,
          averageGrade,
        };
      })
    );

    // Calculate overall stats
    const stats = {
      total: studentsWithStats.length,
      active: studentsWithStats.filter((s) => s.status === "active").length,
      averageGrade:
        studentsWithStats.reduce((sum, s) => sum + (s.averageGrade || 0), 0) /
          studentsWithStats.length || 0,
      attendanceRate:
        studentsWithStats.reduce((sum, s) => sum + s.attendanceRate, 0) /
          studentsWithStats.length || 0,
    };

    successResponse(
      res,
      { students: studentsWithStats, stats },
      "Lấy danh sách học viên thành công"
    );
  } catch (error) {
    console.error("Error in getClassStudents:", error);
    errorResponse(res, "Không thể lấy danh sách học viên", 500);
  }
};

/**
 * Get sessions for a class
 */
exports.getClassSessions = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    });

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    const sessions = await Schedule.find({ class: classId }).sort({ date: -1 });

    successResponse(res, { sessions }, "Lấy danh sách buổi học thành công");
  } catch (error) {
    console.error("Error in getClassSessions:", error);
    errorResponse(res, "Không thể lấy danh sách buổi học", 500);
  }
};

/**
 * Create a new session
 */
exports.createSession = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.body;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    });

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    const session = await Schedule.create({
      class: classId,
      date,
      teacher: teacherId,
      status: "scheduled",
    });

    successResponse(res, { session }, "Tạo buổi học thành công", 201);
  } catch (error) {
    console.error("Error in createSession:", error);
    errorResponse(res, "Không thể tạo buổi học", 500);
  }
};

/**
 * Get attendance for a session
 */
exports.getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const teacherId = req.user._id;

    // Verify session belongs to teacher
    const session = await Schedule.findById(sessionId).populate("class");
    if (!session || session.class.teacher.toString() !== teacherId.toString()) {
      return errorResponse(res, "Không có quyền truy cập", 403);
    }

    const attendance = await Attendance.find({ session: sessionId }).populate(
      "student",
      "studentId fullName"
    );

    successResponse(res, { attendance }, "Lấy điểm danh thành công");
  } catch (error) {
    console.error("Error in getSessionAttendance:", error);
    errorResponse(res, "Không thể lấy điểm danh", 500);
  }
};

/**
 * Mark attendance for a session
 */
exports.markAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { attendance } = req.body;
    const teacherId = req.user._id;

    // Verify session belongs to teacher
    const session = await Schedule.findById(sessionId).populate("class");
    if (!session || session.class.teacher.toString() !== teacherId.toString()) {
      return errorResponse(res, "Không có quyền truy cập", 403);
    }

    // Delete existing attendance for this session
    await Attendance.deleteMany({ session: sessionId });

    // Create new attendance records
    const attendanceRecords = await Attendance.insertMany(
      attendance.map((record) => ({
        ...record,
        class: session.class._id,
        session: sessionId,
        date: session.date,
      }))
    );

    // Update session status
    await Schedule.findByIdAndUpdate(sessionId, { status: "completed" });

    successResponse(
      res,
      { attendance: attendanceRecords },
      "Điểm danh thành công"
    );
  } catch (error) {
    console.error("Error in markAttendance:", error);
    errorResponse(res, "Không thể lưu điểm danh", 500);
  }
};

/**
 * Get grades for a class
 */
exports.getClassGrades = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    });

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    const grades = await Grade.find({ class: classId }).populate(
      "student",
      "studentId fullName"
    );

    successResponse(res, { grades }, "Lấy điểm thành công");
  } catch (error) {
    console.error("Error in getClassGrades:", error);
    errorResponse(res, "Không thể lấy điểm", 500);
  }
};

/**
 * Save grades for students
 */
exports.saveGrades = async (req, res) => {
  try {
    const { classId } = req.params;
    const { grades } = req.body;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    });

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    // Update or create grades
    const gradePromises = grades.map((gradeData) => {
      return Grade.findOneAndUpdate(
        {
          class: classId,
          student: gradeData.student,
          gradeType: gradeData.gradeType,
        },
        {
          ...gradeData,
          class: classId,
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(gradePromises);

    successResponse(res, {}, "Lưu điểm thành công");
  } catch (error) {
    console.error("Error in saveGrades:", error);
    errorResponse(res, "Không thể lưu điểm", 500);
  }
};

/**
 * Get class statistics
 */
exports.getClassStatistics = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    }).populate("students.student");

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    // Calculate statistics
    const students = classData.students;
    const totalStudents = students.length;

    // Get all grades and attendance
    const grades = await Grade.find({ class: classId });
    const attendance = await Attendance.find({ class: classId });

    // Calculate average grade
    let averageGrade = 0;
    if (grades.length > 0) {
      const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
      averageGrade = totalScore / grades.length;
    }

    // Calculate attendance rate
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(
      (a) => a.status === "present" || a.status === "late"
    ).length;
    const attendanceRate =
      totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // Grade distribution
    const gradeDistribution = [
      { range: "9-10", count: grades.filter((g) => g.score >= 9).length },
      {
        range: "8-9",
        count: grades.filter((g) => g.score >= 8 && g.score < 9).length,
      },
      {
        range: "6-8",
        count: grades.filter((g) => g.score >= 6 && g.score < 8).length,
      },
      {
        range: "5-6",
        count: grades.filter((g) => g.score >= 5 && g.score < 6).length,
      },
      { range: "0-5", count: grades.filter((g) => g.score < 5).length },
    ];

    // Attendance distribution
    const attendanceDistribution = [
      {
        status: "Có mặt",
        count: attendance.filter((a) => a.status === "present").length,
      },
      {
        status: "Vắng",
        count: attendance.filter((a) => a.status === "absent").length,
      },
      {
        status: "Muộn",
        count: attendance.filter((a) => a.status === "late").length,
      },
      {
        status: "Có phép",
        count: attendance.filter((a) => a.status === "excused").length,
      },
    ];

    // Students need attention
    const studentsNeedAttention = [];
    for (const studentRecord of students) {
      const studentGrades = grades.filter(
        (g) => g.student.toString() === studentRecord.student._id.toString()
      );
      const studentAttendance = attendance.filter(
        (a) => a.student.toString() === studentRecord.student._id.toString()
      );

      const avgGrade =
        studentGrades.length > 0
          ? studentGrades.reduce((sum, g) => sum + g.score, 0) /
            studentGrades.length
          : 0;

      const attRate =
        studentAttendance.length > 0
          ? (studentAttendance.filter(
              (a) => a.status === "present" || a.status === "late"
            ).length /
              studentAttendance.length) *
            100
          : 0;

      if (avgGrade < 5 || attRate < 60) {
        studentsNeedAttention.push({
          ...studentRecord.student.toObject(),
          averageGrade: avgGrade,
          attendanceRate: attRate,
        });
      }
    }

    const stats = {
      totalStudents,
      averageGrade,
      attendanceRate,
      warningStudents: studentsNeedAttention.length,
      gradeDistribution,
      attendanceDistribution,
      studentsNeedAttention,
    };

    successResponse(res, stats, "Lấy thống kê thành công");
  } catch (error) {
    console.error("Error in getClassStatistics:", error);
    errorResponse(res, "Không thể lấy thống kê", 500);
  }
};

/**
 * Get or create evaluations for students
 */
exports.getClassEvaluations = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    });

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    // This would need an Evaluation model - placeholder for now
    // const evaluations = await Evaluation.find({ class: classId })
    //   .populate('student', 'studentId fullName');

    successResponse(res, { evaluations: [] }, "Lấy đánh giá thành công");
  } catch (error) {
    console.error("Error in getClassEvaluations:", error);
    errorResponse(res, "Không thể lấy đánh giá", 500);
  }
};

/**
 * Save student evaluations
 */
exports.saveEvaluations = async (req, res) => {
  try {
    const { classId } = req.params;
    const { evaluations } = req.body;
    const teacherId = req.user._id;

    // Verify teacher owns this class
    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId,
    });

    if (!classData) {
      return errorResponse(res, "Không tìm thấy lớp học", 404);
    }

    // This would need an Evaluation model - placeholder for now
    successResponse(res, {}, "Lưu đánh giá thành công");
  } catch (error) {
    console.error("Error in saveEvaluations:", error);
    errorResponse(res, "Không thể lưu đánh giá", 500);
  }
};

/**
 * Get teacher schedule
 */
exports.getSchedule = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { date, view } = req.query;

    let startDate, endDate;
    const selectedDate = date ? new Date(date) : new Date();

    if (view === "week") {
      // Get week range
      const dayOfWeek = selectedDate.getDay();
      startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else {
      // Get month range
      startDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );
      endDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      );
    }

    const schedule = await Schedule.find({
      teacher: teacherId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("class", "name students")
      .sort({ date: 1, startTime: 1 });

    successResponse(res, { schedule }, "Lấy lịch dạy thành công");
  } catch (error) {
    console.error("Error in getSchedule:", error);
    errorResponse(res, "Không thể lấy lịch dạy", 500);
  }
};

/**
 * Get teacher notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { status } = req.query;

    const query = { recipient: teacherId, recipientType: "teacher" };
    if (status === "unread") {
      query.isRead = false;
    } else if (status === "read") {
      query.isRead = true;
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });

    successResponse(res, { notifications }, "Lấy thông báo thành công");
  } catch (error) {
    console.error("Error in getNotifications:", error);
    errorResponse(res, "Không thể lấy thông báo", 500);
  }
};

/**
 * Mark notification as read
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const teacherId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: teacherId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, "Không tìm thấy thông báo", 404);
    }

    successResponse(res, { notification }, "Cập nhật thành công");
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    errorResponse(res, "Không thể cập nhật", 500);
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const teacherId = req.user._id;

    await Notification.updateMany(
      { recipient: teacherId, isRead: false },
      { isRead: true }
    );

    successResponse(res, {}, "Cập nhật thành công");
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    errorResponse(res, "Không thể cập nhật", 500);
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const teacherId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: teacherId,
    });

    if (!notification) {
      return errorResponse(res, "Không tìm thấy thông báo", 404);
    }

    successResponse(res, {}, "Xóa thành công");
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    errorResponse(res, "Không thể xóa", 500);
  }
};
