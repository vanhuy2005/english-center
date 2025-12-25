/**
 * @desc    Get all students in a class
 * @route   GET /api/classes/:id/students
 * @access  Private (director, enrollment, academic, teacher)
 */
exports.getClassStudents = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate({
      path: "students.student",
      select: "studentCode fullName email phone status",
    });
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }
    // Flatten students array and return only student info
    const students = (classData.students || [])
      .map((s) => s.student)
      .filter(Boolean);
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching class students:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách học viên của lớp",
      error: error.message,
    });
  }
};
const mongoose = require("mongoose");
const Class = require("../../shared/models/Class.model");
const Student = require("../../shared/models/Student.model");
const Staff = require("../../shared/models/Staff.model");
const Course = require("../../shared/models/Course.model");

/**
 * @desc    Get all classes with filters, pagination, search
 * @route   GET /api/classes
 * @access  Private (director, staff, teacher)
 */
exports.getAllClasses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      course,
      teacher,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { classCode: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (course) filter.course = course;
    if (teacher) filter.teacher = teacher;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Execute query
    const classes = await Class.find(filter)
      .populate("course", "name courseCode level fee duration")
      .populate("teacher", "fullName email phone specialization")
      .populate({
        path: "students.student",
        select: "studentCode fullName email phone status",
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Class.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách lớp học",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single class by ID
 * @route   GET /api/classes/:id
 * @access  Private
 */
exports.getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate("course", "name courseCode level fee duration description")
      .populate("teacher", "fullName email phone specialization experience")
      .populate({
        path: "students.student",
        select: "studentCode fullName email phone dateOfBirth address status",
      });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin lớp học",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new class
 * @route   POST /api/classes
 * @access  Private (director, academic staff)
 */
exports.createClass = async (req, res) => {
  try {
    const {
      className,
      name,
      classCode,
      course,
      teacher,
      schedule,
      startDate,
      endDate,
      maxStudents,
      room,
      tuitionFee,
      status,
    } = req.body;

    // Debug: log incoming payload to help diagnose missing fields
    console.log("📝 POST /api/classes payload:", {
      className,
      name,
      classCode,
      course,
      teacher,
      startDate,
      endDate,
      maxStudents,
      room,
      status,
    });

    const finalName = className || name;

    // Validate required fields
    const missing = [];
    if (!finalName) missing.push("name");
    if (!course) missing.push("course");
    if (!startDate) missing.push("startDate");
    if (!endDate) missing.push("endDate");

    if (missing.length) {
      console.warn("Create class validation failed - missing:", missing);
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc",
        missing,
      });
    }

    // Validate date ordering
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu hoặc kết thúc không hợp lệ",
      });
    }
    if (ed <= sd) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải lớn hơn ngày bắt đầu",
      });
    }

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    // Check if teacher exists (if provided)
    if (teacher) {
      const teacherExists = await Staff.findOne({
        _id: teacher,
        staffType: "teacher",
      });
      if (!teacherExists) {
        return res.status(404).json({
          success: false,
          message: "Giáo viên không tồn tại",
        });
      }
    }

    // Normalize schedule: the client may send a free-text string (legacy UI).
    // The Class model expects an array of schedule items; if the incoming
    // `schedule` is not an array, we default to an empty array to avoid
    // triggering subdocument validation errors.
    const normalizedSchedule = Array.isArray(schedule) ? schedule : [];

    // Create class
    const newClass = await Class.create({
      name: finalName,
      classCode: classCode || undefined,
      course,
      teacher,
      schedule: normalizedSchedule,
      startDate,
      endDate,
      capacity: { max: maxStudents || 30 },
      room,
      tuitionFee:
        tuitionFee || (courseExists.fee && courseExists.fee.amount) || 0,
      status: status || "upcoming",
      createdBy: req.user._id,
    });

    // Populate for response
    const populatedClass = await Class.findById(newClass._id)
      .populate("course", "name courseCode level")
      .populate("teacher", "fullName email");

    res.status(201).json({
      success: true,
      message: "Tạo lớp học thành công",
      data: populatedClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);

    // Mongoose validation errors -> return 400 with details
    if (error && error.name === "ValidationError") {
      const errors = Object.keys(error.errors || {}).map((k) => ({
        field: k,
        message: error.errors[k].message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation error when creating class",
        errors,
      });
    }

    // Duplicate key (unique) error
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value error",
        error: error.keyValue || error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo lớp học",
      error: error.message,
    });
  }
};

/**
 * @desc    Update class
 * @route   PUT /api/classes/:id
 * @access  Private (director, academic staff)
 */
exports.updateClass = async (req, res) => {
  try {
    console.log("📝 UPDATE CLASS - Request params:", req.params);
    console.log(
      "📝 UPDATE CLASS - Request body:",
      JSON.stringify(req.body, null, 2)
    );

    const classData = await Class.findById(req.params.id);

    if (!classData) {
      console.log("❌ Class not found:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    console.log("✅ Found class:", classData.name);

    const {
      className,
      name,
      classCode,
      teacher,
      schedule,
      startDate,
      endDate,
      maxStudents,
      room,
      tuitionFee,
      status,
    } = req.body;

    // Check if teacher exists (if provided)
    if (teacher && teacher !== classData.teacher?.toString()) {
      console.log("🔍 Validating top-level teacher:", teacher);
      const teacherExists = await Staff.findOne({
        _id: teacher,
        staffType: "teacher",
      });
      if (!teacherExists) {
        console.log("❌ Teacher not found:", teacher);
        return res.status(404).json({
          success: false,
          message: "Giáo viên không tồn tại",
        });
      }
      console.log("✅ Teacher validated:", teacherExists.fullName);
    }

    // Validate teachers in schedule items (if schedule provided)
    if (schedule && Array.isArray(schedule)) {
      console.log("🔍 Validating schedule items:", schedule.length);

      for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i];
        console.log(`🔍 Schedule item ${i}:`, item);

        if (item.teacher) {
          // Skip validation if teacher is null or empty string
          if (item.teacher === null || item.teacher === "") {
            console.log(
              `⚠️ Schedule item ${i}: Empty teacher, setting to null`
            );
            item.teacher = null; // Normalize empty values
            continue;
          }

          console.log(
            `🔍 Validating teacher in schedule item ${i}:`,
            item.teacher
          );

          // Check if it's a valid ObjectId format first
          if (!mongoose.Types.ObjectId.isValid(item.teacher)) {
            console.log(
              `❌ Invalid teacher ID format in schedule item ${i}:`,
              item.teacher
            );
            return res.status(400).json({
              success: false,
              message: `ID giáo viên không hợp lệ trong lịch học ngày ${item.dayOfWeek}`,
            });
          }

          const teacherExists = await Staff.findOne({
            _id: item.teacher,
            staffType: "teacher",
          });

          if (!teacherExists) {
            console.log(
              `❌ Teacher not found in schedule item ${i}:`,
              item.teacher
            );
            return res.status(404).json({
              success: false,
              message: `Giáo viên không tồn tại trong lịch học ngày ${item.dayOfWeek}`,
            });
          }
          console.log(
            `✅ Teacher validated in schedule item ${i}:`,
            teacherExists.fullName
          );
        }
      }
    }

    // Update fields
    const updateFields = {};
    if (className || name) updateFields.name = className || name;
    if (classCode) updateFields.classCode = classCode;
    if (teacher) updateFields.teacher = teacher;
    if (schedule) updateFields.schedule = schedule;
    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;
    if (maxStudents) updateFields["capacity.max"] = maxStudents;
    if (room) updateFields.room = room;
    if (tuitionFee) updateFields.tuitionFee = tuitionFee;
    if (status) updateFields.status = status;

    console.log("💾 Saving class data with findByIdAndUpdate...");

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate("course", "name courseCode level")
      .populate("teacher", "fullName email")
      .populate("students.student", "studentCode fullName");

    console.log("✅ Update successful, returning data");

    res.status(200).json({
      success: true,
      message: "Cập nhật lớp học thành công",
      data: updatedClass,
    });
  } catch (error) {
    console.error("❌ ERROR updating class:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);

    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật lớp học",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * @desc    Delete class
 * @route   DELETE /api/classes/:id
 * @access  Private (director)
 */
exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    // Check if class has students
    if (classData.students && classData.students.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa lớp học đã có học viên. Vui lòng chuyển học viên sang lớp khác trước.",
      });
    }

    await classData.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa lớp học thành công",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa lớp học",
      error: error.message,
    });
  }
};

/**
 * @desc    Add student to class
 * @route   POST /api/classes/:id/students/:studentId
 * @access  Private (director, enrollment staff)
 */
exports.addStudentToClass = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classData = await Class.findById(id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy học viên",
      });
    }

    // Check if class is full
    if (classData.students.length >= classData.capacity.max) {
      return res.status(400).json({
        success: false,
        message: "Lớp học đã đầy",
      });
    }

    // Check if student already in class
    if (classData.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Học viên đã có trong lớp này",
      });
    }

    // Add student to class
    classData.students.push(studentId);
    classData.capacity.current = classData.students.length;
    await classData.save();

    // Update student's classes
    if (!student.classes) student.classes = [];
    if (!student.classes.includes(id)) {
      student.classes.push(id);
      await student.save();
    }

    const updatedClass = await Class.findById(id).populate(
      "students",
      "studentCode fullName email phone"
    );

    res.status(200).json({
      success: true,
      message: "Thêm học viên vào lớp thành công",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Error adding student to class:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm học viên vào lớp",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove student from class
 * @route   DELETE /api/classes/:id/students/:studentId
 * @access  Private (director, academic staff)
 */
exports.removeStudentFromClass = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classData = await Class.findById(id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    // Check if student is in class
    if (!classData.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Học viên không có trong lớp này",
      });
    }

    // Remove student from class
    classData.students = classData.students.filter(
      (s) => s.toString() !== studentId
    );
    classData.capacity.current = classData.students.length;
    await classData.save();

    // Update student's classes
    const student = await Student.findById(studentId);
    if (student && student.classes) {
      student.classes = student.classes.filter((c) => c.toString() !== id);
      await student.save();
    }

    const updatedClass = await Class.findById(id).populate(
      "students",
      "studentCode fullName email phone"
    );

    res.status(200).json({
      success: true,
      message: "Xóa học viên khỏi lớp thành công",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Error removing student from class:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa học viên khỏi lớp",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class schedule
 * @route   GET /api/classes/:id/schedule
 * @access  Private
 */
exports.getClassSchedule = async (req, res) => {
  try {
    const Schedule = require("../../shared/models/Schedule.model");

    const schedules = await Schedule.find({ class: req.params.id })
      .populate("teacher", "fullName")
      .populate("class", "className classCode")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching class schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch học",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class statistics
 * @route   GET /api/classes/:id/stats
 * @access  Private
 */
exports.getClassStats = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate("students");

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    const Attendance = require("../../shared/models/Attendance.model");
    const Grade = require("../../shared/models/Grade.model");

    // Get attendance stats
    const attendanceStats = await Attendance.aggregate([
      { $match: { class: classData._id } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          lateCount: {
            $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get grade stats
    const gradeStats = await Grade.getClassAverage(req.params.id);

    const stats = {
      enrollment: {
        current: classData.students.length,
        max: classData.capacity.max,
        percentage: Math.round(
          (classData.students.length / classData.capacity.max) * 100
        ),
      },
      attendance: attendanceStats[0] || {
        totalSessions: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
      },
      grades: gradeStats,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching class stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê lớp học",
      error: error.message,
    });
  }
};
