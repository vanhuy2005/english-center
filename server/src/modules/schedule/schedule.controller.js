const Schedule = require("../../shared/models/Schedule.model");
const Class = require("../../shared/models/Class.model");
const Staff = require("../../shared/models/Staff.model");

/**
 * @desc    Get all schedules with filters
 * @route   GET /api/schedules
 * @access  Private
 */
exports.getAllSchedules = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      class: classId,
      teacher,
      startDate,
      endDate,
      dayOfWeek,
      status,
    } = req.query;

    const filter = {};

    if (classId) filter.class = classId;
    if (teacher) filter.teacher = teacher;
    if (status) filter.status = status;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const schedules = await Schedule.find(filter)
      .populate("class", "className classCode room")
      .populate("teacher", "fullName email phone")
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Schedule.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch học",
      error: error.message,
    });
  }
};

/**
 * @desc    Get schedule by ID
 * @route   GET /api/schedules/:id
 * @access  Private
 */
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate("class", "className classCode room course")
      .populate("teacher", "fullName email phone specialization");

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch học",
      });
    }

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin lịch học",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new schedule
 * @route   POST /api/schedules
 * @access  Private (director, academic staff)
 */
exports.createSchedule = async (req, res) => {
  try {
    const {
      class: classId,
      teacher,
      student,
      date,
      startTime,
      endTime,
      dayOfWeek,
      room,
      topic,
      description,
      materials,
      isRecurring,
      recurrence,
    } = req.body;

    // Validate required fields: allow student-specific schedules (no class)
    if (!date || !startTime || !endTime || (!classId && !student)) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng cung cấp đầy đủ thông tin bắt buộc (class hoặc student, date, startTime, endTime)",
      });
    }

    let classData = null;
    if (classId) {
      classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Lớp học không tồn tại",
        });
      }
    }

    // Determine teacher: class teacher if not provided and class exists
    const scheduleTeacher = teacher || (classData ? classData.teacher : null);

    // If teacher provided, validate existence
    if (scheduleTeacher) {
      const teacherExists = await Staff.findOne({ _id: scheduleTeacher });
      if (!teacherExists) {
        return res.status(404).json({
          success: false,
          message: "Giáo viên không tồn tại",
        });
      }
    }

    // Check for scheduling conflicts only when teacher or room present
    const conflictQuery = { $and: [] };
    const timeOverlap = {
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
      ],
    };

    const orClauses = [];
    if (scheduleTeacher) {
      orClauses.push({
        teacher: scheduleTeacher,
        date,
        status: { $ne: "cancelled" },
      });
    }
    if (room) {
      orClauses.push({ room, date, status: { $ne: "cancelled" } });
    }

    let conflict = null;
    if (orClauses.length > 0) {
      conflict = await Schedule.findOne({
        $and: [{ $or: orClauses }, timeOverlap],
      });
    }

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Có xung đột lịch học với giáo viên hoặc phòng học",
      });
    }

    // Create schedule object
    const createPayload = {
      date,
      startTime,
      endTime,
      dayOfWeek: dayOfWeek || new Date(date).getDay(),
      room: room || (classData ? classData.room : undefined),
      topic,
      description,
      materials,
      isRecurring,
      recurrence,
      createdBy: req.user._id,
    };

    if (classData) createPayload.class = classId;
    if (scheduleTeacher) createPayload.teacher = scheduleTeacher;
    if (student) createPayload.student = student;

    const schedule = await Schedule.create(createPayload);

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate("class", "className classCode")
      .populate("teacher", "fullName email")
      .populate("student", "name email phone");

    res.status(201).json({
      success: true,
      message: "Tạo lịch học thành công",
      data: populatedSchedule,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo lịch học",
      error: error.message,
    });
  }
};

/**
 * @desc    Update schedule
 * @route   PUT /api/schedules/:id
 * @access  Private (director, academic staff)
 */
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch học",
      });
    }

    const allowedUpdates = [
      "teacher",
      "date",
      "startTime",
      "endTime",
      "room",
      "topic",
      "description",
      "materials",
      "status",
      "notes",
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        schedule[key] = req.body[key];
      }
    });

    await schedule.save();

    const updatedSchedule = await Schedule.findById(schedule._id)
      .populate("class", "className classCode")
      .populate("teacher", "fullName email");

    res.status(200).json({
      success: true,
      message: "Cập nhật lịch học thành công",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật lịch học",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete schedule
 * @route   DELETE /api/schedules/:id
 * @access  Private (director, academic staff)
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch học",
      });
    }

    // Check if schedule has attendance records
    const Attendance = require("../../shared/models/Attendance.model");
    const hasAttendance = await Attendance.countDocuments({
      schedule: req.params.id,
    });

    if (hasAttendance > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa lịch học đã có điểm danh",
      });
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa lịch học thành công",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa lịch học",
      error: error.message,
    });
  }
};

/**
 * @desc    Get teacher's schedule
 * @route   GET /api/schedules/teacher/:teacherId
 * @access  Private
 */
exports.getTeacherSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { teacher: req.params.teacherId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const schedules = await Schedule.find(filter)
      .populate("class", "className classCode room")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching teacher schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch dạy",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class schedule
 * @route   GET /api/schedules/class/:classId
 * @access  Private
 */
exports.getClassSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { class: req.params.classId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const schedules = await Schedule.find(filter)
      .populate("teacher", "fullName email")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching class schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch học của lớp",
      error: error.message,
    });
  }
};

/**
 * @desc    Create recurring schedules
 * @route   POST /api/schedules/recurring
 * @access  Private (director, academic staff)
 */
exports.createRecurringSchedules = async (req, res) => {
  try {
    const {
      class: classId,
      teacher,
      startDate,
      endDate,
      daysOfWeek, // [1, 3, 5] for Mon, Wed, Fri
      startTime,
      endTime,
      room,
    } = req.body;

    if (
      !classId ||
      !startDate ||
      !endDate ||
      !daysOfWeek ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Lớp học không tồn tại",
      });
    }

    const scheduleTeacher = teacher || classData.teacher;
    const scheduleRoom = room || classData.room;

    const schedules = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate schedules for each day
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();

      if (daysOfWeek.includes(dayOfWeek)) {
        const schedule = await Schedule.create({
          class: classId,
          teacher: scheduleTeacher,
          date: new Date(date),
          startTime,
          endTime,
          dayOfWeek,
          room: scheduleRoom,
          isRecurring: true,
          createdBy: req.user._id,
        });
        schedules.push(schedule);
      }
    }

    res.status(201).json({
      success: true,
      message: `Đã tạo ${schedules.length} buổi học`,
      data: schedules,
    });
  } catch (error) {
    console.error("Error creating recurring schedules:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo lịch học định kỳ",
      error: error.message,
    });
  }
};

/**
 * @desc    Get my schedules (for students/teachers)
 * @route   GET /api/schedules/me
 * @access  Private (student, teacher)
 */
exports.getMySchedules = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;
    const userRole = req.userType || req.role || "student";

    console.log("📅 Getting schedules for user:", userId, "Role:", userRole);

    let filter = {};

    // Build filter based on role
    if (userRole === "teacher" || req.role === "teacher") {
      filter.teacher = userId;
    } else if (userRole === "student" || req.role === "student") {
      // Find classes where this student is enrolled (via students array)
      const Class = require("../../shared/models/Class.model");
      const classes = await Class.find({
        "students.student": userId,
        "students.status": "active",
      }).select("_id");

      const classIds = classes.map((c) => c._id);

      // Filter: schedules for student's classes OR schedules explicitly assigned to the student
      filter = {
        $or: [
          classIds.length > 0 ? { class: { $in: classIds } } : null,
          { student: userId },
        ].filter(Boolean),
      };
      console.log(
        "📚 Found",
        classIds.length,
        "classes for student; including personal schedules"
      );
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const schedules = await Schedule.find(filter)
      .populate("class", "name classCode room")
      .populate("teacher", "fullName")
      .populate({
        path: "class",
        populate: { path: "course", select: "name courseCode" },
      })
      .sort({ date: 1, startTime: 1 });

    console.log("✅ Found", schedules.length, "schedules");

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Get My Schedules Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch học",
      error: error.message,
    });
  }
};
