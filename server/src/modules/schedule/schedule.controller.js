const Schedule = require("../../shared/models/Schedule.model");
const Class = require("../../shared/models/Class.model");
const Teacher = require("../../shared/models/Teacher.model");

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

    // Validate required fields
    if (!classId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc",
      });
    }

    // Check if class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Lớp học không tồn tại",
      });
    }

    // Use class teacher if no teacher specified
    const scheduleTeacher = teacher || classData.teacher;

    // Check if teacher exists
    if (scheduleTeacher) {
      const teacherExists = await Teacher.findById(scheduleTeacher);
      if (!teacherExists) {
        return res.status(404).json({
          success: false,
          message: "Giáo viên không tồn tại",
        });
      }
    }

    // Check for scheduling conflicts
    const conflict = await Schedule.findOne({
      $or: [
        { teacher: scheduleTeacher, date, status: { $ne: "cancelled" } },
        { room, date, status: { $ne: "cancelled" } },
      ],
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
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Có xung đột lịch học với giáo viên hoặc phòng học",
      });
    }

    // Create schedule
    const schedule = await Schedule.create({
      class: classId,
      teacher: scheduleTeacher,
      date,
      startTime,
      endTime,
      dayOfWeek: dayOfWeek || new Date(date).getDay(),
      room: room || classData.room,
      topic,
      description,
      materials,
      isRecurring,
      recurrence,
      createdBy: req.user._id,
    });

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate("class", "className classCode")
      .populate("teacher", "fullName email");

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
