const Attendance = require("../../shared/models/Attendance.model");
const Schedule = require("../../shared/models/Schedule.model");
const Class = require("../../shared/models/Class.model");
const Student = require("../../shared/models/Student.model");

/**
 * @desc    Get all attendance records with filters
 * @route   GET /api/attendance
 * @access  Private
 */
exports.getAllAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      class: classId,
      student,
      schedule,
      status,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (classId) filter.class = classId;
    if (student) filter.student = student;
    if (schedule) filter.schedule = schedule;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attendance = await Attendance.find(filter)
      .populate("student", "studentCode fullName email")
      .populate("class", "className classCode")
      .populate("schedule", "date startTime endTime topic")
      .populate("markedBy", "fullName")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu điểm danh",
      error: error.message,
    });
  }
};

/**
 * @desc    Get attendance by ID
 * @route   GET /api/attendance/:id
 * @access  Private
 */
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("student", "studentCode fullName email phone")
      .populate("class", "className classCode room")
      .populate("schedule", "date startTime endTime topic")
      .populate("markedBy", "fullName email");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi điểm danh",
      });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin điểm danh",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark attendance for a class session
 * @route   POST /api/attendance/mark
 * @access  Private (teacher, academic staff, director)
 */
exports.markAttendance = async (req, res) => {
  try {
    const { scheduleId, attendanceList } = req.body;
    // attendanceList: [{ studentId, status, checkInTime, notes }]

    if (!scheduleId || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin điểm danh",
      });
    }

    const schedule = await Schedule.findById(scheduleId).populate("class");
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch học",
      });
    }

    const classData = schedule.class;
    const attendanceRecords = [];

    for (const record of attendanceList) {
      const { studentId, status, checkInTime, notes } = record;

      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student) {
        continue; // Skip invalid students
      }

      // Check if attendance already exists
      let attendance = await Attendance.findOne({
        student: studentId,
        class: classData._id,
        schedule: scheduleId,
      });

      if (attendance) {
        // Update existing attendance
        attendance.status = status;
        attendance.checkInTime = checkInTime || attendance.checkInTime;
        attendance.notes = notes || attendance.notes;
        attendance.markedBy = req.user._id;
        attendance.markedAt = new Date();
        await attendance.save();
      } else {
        // Create new attendance
        attendance = await Attendance.create({
          student: studentId,
          class: classData._id,
          schedule: scheduleId,
          date: schedule.date,
          status,
          checkInTime: checkInTime || new Date(),
          notes,
          markedBy: req.user._id,
          markedAt: new Date(),
        });
      }

      attendanceRecords.push(attendance);
    }

    // Update schedule status to completed
    if (schedule.status !== "completed") {
      schedule.status = "completed";
      await schedule.save();
    }

    res.status(200).json({
      success: true,
      message: `Đã điểm danh ${attendanceRecords.length} học viên`,
      data: attendanceRecords,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi điểm danh",
      error: error.message,
    });
  }
};

/**
 * @desc    Update single attendance record
 * @route   PUT /api/attendance/:id
 * @access  Private (teacher, academic staff, director)
 */
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi điểm danh",
      });
    }

    const { status, checkInTime, checkOutTime, notes } = req.body;

    if (status) attendance.status = status;
    if (checkInTime) attendance.checkInTime = checkInTime;
    if (checkOutTime) attendance.checkOutTime = checkOutTime;
    if (notes !== undefined) attendance.notes = notes;

    attendance.markedBy = req.user._id;
    attendance.markedAt = new Date();

    await attendance.save();

    const updatedAttendance = await Attendance.findById(attendance._id)
      .populate("student", "studentCode fullName")
      .populate("class", "className classCode")
      .populate("markedBy", "fullName");

    res.status(200).json({
      success: true,
      message: "Cập nhật điểm danh thành công",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật điểm danh",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete attendance record
 * @route   DELETE /api/attendance/:id
 * @access  Private (director, academic staff)
 */
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi điểm danh",
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa bản ghi điểm danh thành công",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa điểm danh",
      error: error.message,
    });
  }
};

/**
 * @desc    Get student attendance report
 * @route   GET /api/attendance/student/:studentId
 * @access  Private
 */
exports.getStudentAttendance = async (req, res) => {
  try {
    const { startDate, endDate, class: classId } = req.query;

    const filter = { student: req.params.studentId };

    if (classId) filter.class = classId;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(filter)
      .populate("class", "className classCode")
      .populate("schedule", "date topic")
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      late: attendance.filter((a) => a.status === "late").length,
      excused: attendance.filter((a) => a.status === "excused").length,
    };

    stats.attendanceRate =
      stats.total > 0
        ? Math.round(((stats.present + stats.late) / stats.total) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        attendance,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy báo cáo điểm danh học viên",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class attendance report
 * @route   GET /api/attendance/class/:classId
 * @access  Private
 */
exports.getClassAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { class: req.params.classId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(filter)
      .populate("student", "studentCode fullName email")
      .populate("schedule", "date topic")
      .sort({ date: -1 });

    // Group by student
    const byStudent = {};
    attendance.forEach((record) => {
      const studentId = record.student._id.toString();
      if (!byStudent[studentId]) {
        byStudent[studentId] = {
          student: record.student,
          records: [],
          stats: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
          },
        };
      }
      byStudent[studentId].records.push(record);
      byStudent[studentId].stats.total++;
      byStudent[studentId].stats[record.status]++;
    });

    // Calculate attendance rate for each student
    Object.values(byStudent).forEach((studentData) => {
      const { present, late, total } = studentData.stats;
      studentData.stats.attendanceRate =
        total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    });

    // Overall class stats
    const overallStats = {
      totalSessions: new Set(attendance.map((a) => a.schedule?.toString()))
        .size,
      totalRecords: attendance.length,
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      late: attendance.filter((a) => a.status === "late").length,
      excused: attendance.filter((a) => a.status === "excused").length,
    };

    overallStats.averageAttendanceRate =
      overallStats.totalRecords > 0
        ? Math.round(
            ((overallStats.present + overallStats.late) /
              overallStats.totalRecords) *
              100
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        byStudent: Object.values(byStudent),
        overallStats,
      },
    });
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy báo cáo điểm danh lớp học",
      error: error.message,
    });
  }
};

/**
 * @desc    Get attendance for specific schedule/session
 * @route   GET /api/attendance/schedule/:scheduleId
 * @access  Private
 */
exports.getScheduleAttendance = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch học",
      });
    }

    const attendance = await Attendance.find({
      schedule: req.params.scheduleId,
    })
      .populate("student", "studentCode fullName email phone")
      .sort({ "student.fullName": 1 });

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching schedule attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy điểm danh buổi học",
      error: error.message,
    });
  }
};
