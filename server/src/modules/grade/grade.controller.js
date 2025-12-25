const Grade = require("../../shared/models/Grade.model");
const Class = require("../../shared/models/Class.model");
const Student = require("../../shared/models/Student.model");
const Course = require("../../shared/models/Course.model");

/**
 * @desc    Get all grades with filters
 * @route   GET /api/grades
 * @access  Private
 */
exports.getAllGrades = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      student,
      class: classId,
      course,
      status,
      isPublished,
    } = req.query;

    const filter = {};

    if (student) filter.student = student;
    if (classId) filter.class = classId;
    if (course) filter.course = course;
    if (status) filter.status = status;
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const grades = await Grade.find(filter)
      .populate("student", "studentCode fullName email")
      .populate("class", "className classCode")
      .populate("course", "name courseCode level")
      .populate("gradedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Grade.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: grades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu điểm số",
      error: error.message,
    });
  }
};

/**
 * @desc    Get grade by ID
 * @route   GET /api/grades/:id
 * @access  Private
 */
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate("student", "studentCode fullName email phone dateOfBirth")
      .populate("class", "className classCode room")
      .populate("course", "name courseCode level description")
      .populate("gradedBy", "fullName email");

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy điểm số",
      });
    }

    res.status(200).json({
      success: true,
      data: grade,
    });
  } catch (error) {
    console.error("Error fetching grade:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin điểm số",
      error: error.message,
    });
  }
};

/**
 * @desc    Create or update grade
 * @route   POST /api/grades
 * @access  Private (teacher, academic staff, director)
 */
exports.createOrUpdateGrade = async (req, res) => {
  try {
    const {
      student,
      class: classId,
      course,
      scores,
      weights,
      teacherComment,
    } = req.body;

    if (!student || !classId || !course) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc",
      });
    }

    // Verify student, class, course exist
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Học viên không tồn tại",
      });
    }

    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "Lớp học không tồn tại",
      });
    }

    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    // Check if grade already exists
    let grade = await Grade.findOne({ student, class: classId, course });

    const gradeData = {
      scores: scores || {},
      weights: weights || {},
      teacherComment,
      gradedBy: req.user._id,
    };

    if (grade) {
      // Update existing grade
      Object.keys(gradeData).forEach((key) => {
        if (gradeData[key] !== undefined) {
          if (key === "scores" || key === "weights") {
            grade[key] = { ...grade[key], ...gradeData[key] };
          } else {
            grade[key] = gradeData[key];
          }
        }
      });
      // Only change publish state when explicitly requested
      if (req.body.isPublished !== undefined) {
        grade.isPublished = req.body.isPublished;
        grade.publishedDate = req.body.isPublished ? new Date() : undefined;
      }

      await grade.save();
    } else {
      // Create new grade as draft by default
      const createPayload = {
        student,
        class: classId,
        course,
        ...gradeData,
        isPublished: req.body.isPublished === true ? true : false,
        publishedDate: req.body.isPublished === true ? new Date() : undefined,
      };

      grade = await Grade.create(createPayload);
    }

    const populatedGrade = await Grade.findById(grade._id)
      .populate("student", "studentCode fullName")
      .populate("class", "className classCode")
      .populate("course", "name courseCode");

    res.status(grade.isNew ? 201 : 200).json({
      success: true,
      message: grade.isNew ? "Tạo điểm thành công" : "Cập nhật điểm thành công",
      data: populatedGrade,
    });
  } catch (error) {
    console.error("Error creating/updating grade:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lưu điểm số",
      error: error.message,
    });
  }
};

/**
 * @desc    Update grade
 * @route   PUT /api/grades/:id
 * @access  Private (teacher, academic staff, director)
 */
exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy điểm số",
      });
    }

    const allowedUpdates = [
      "scores",
      "weights",
      "teacherComment",
      "strengths",
      "weaknesses",
      "recommendations",
      "isPublished",
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (key === "scores" || key === "weights") {
          grade[key] = { ...grade[key], ...req.body[key] };
        } else {
          grade[key] = req.body[key];
        }
      }
    });

    grade.gradedBy = req.user._id;
    await grade.save();

    const updatedGrade = await Grade.findById(grade._id)
      .populate("student", "studentCode fullName")
      .populate("class", "className classCode")
      .populate("course", "name courseCode")
      .populate("gradedBy", "fullName");

    res.status(200).json({
      success: true,
      message: "Cập nhật điểm thành công",
      data: updatedGrade,
    });
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật điểm số",
      error: error.message,
    });
  }
};

/**
 * @desc    Publish/unpublish grade
 * @route   PATCH /api/grades/:id/publish
 * @access  Private (teacher, academic staff, director)
 */
exports.togglePublishGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy điểm số",
      });
    }

    // Prevent publishing grades without any scores
    const hasScores =
      grade.scores &&
      ((grade.scores.midterm !== null && grade.scores.midterm !== undefined) ||
        (grade.scores.final !== null && grade.scores.final !== undefined) ||
        (grade.scores.attendance !== null &&
          grade.scores.attendance !== undefined) ||
        (grade.scores.participation !== null &&
          grade.scores.participation !== undefined) ||
        (grade.scores.homework !== null &&
          grade.scores.homework !== undefined));

    if (!grade.isPublished && !hasScores) {
      return res.status(400).json({
        success: false,
        message: "Không thể công bố điểm khi chưa có điểm thành phần nào",
      });
    }

    grade.isPublished = !grade.isPublished;
    await grade.save();

    res.status(200).json({
      success: true,
      message: grade.isPublished ? "Đã công bố điểm" : "Đã ẩn điểm",
      data: grade,
    });
  } catch (error) {
    console.error("Error publishing grade:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi công bố điểm",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete grade
 * @route   DELETE /api/grades/:id
 * @access  Private (director, academic staff)
 */
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy điểm số",
      });
    }

    await grade.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa điểm thành công",
    });
  } catch (error) {
    console.error("Error deleting grade:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa điểm số",
      error: error.message,
    });
  }
};

/**
 * @desc    Get student transcript
 * @route   GET /api/grades/student/:studentId/transcript
 * @access  Private
 */
exports.getStudentTranscript = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Học viên không tồn tại",
      });
    }

    const transcript = await Grade.getStudentTranscript(req.params.studentId);

    // Calculate overall GPA
    const completedGrades = transcript.filter((g) => g.status === "completed");
    const totalScore =
      completedGrades.reduce((sum, g) => sum + (g.totalScore || 0), 0) /
      (completedGrades.length || 1);
    const gpa = Math.round(totalScore) / 10; // Convert to 4.0 scale approximation

    res.status(200).json({
      success: true,
      data: {
        student,
        transcript,
        summary: {
          totalCourses: transcript.length,
          completedCourses: completedGrades.length,
          gpa: Math.round(gpa * 100) / 100,
          averageScore: Math.round(totalScore * 10) / 10,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bảng điểm",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class grade report
 * @route   GET /api/grades/class/:classId/report
 * @access  Private
 */
exports.getClassGradeReport = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Lớp học không tồn tại",
      });
    }

    const { grades, stats } = await Grade.getClassReport(req.params.classId);

    res.status(200).json({
      success: true,
      data: {
        class: classData,
        grades,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching class grade report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy báo cáo điểm lớp",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class average grades
 * @route   GET /api/grades/class/:classId/average
 * @access  Private
 */
exports.getClassAverage = async (req, res) => {
  try {
    const average = await Grade.getClassAverage(req.params.classId);

    res.status(200).json({
      success: true,
      data: average,
    });
  } catch (error) {
    console.error("Error fetching class average:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy điểm trung bình lớp",
      error: error.message,
    });
  }
};

/**
 * @desc    Bulk import grades from CSV/Excel
 * @route   POST /api/grades/bulk-import
 * @access  Private (teacher, academic staff, director)
 */
exports.bulkImportGrades = async (req, res) => {
  try {
    const { classId, courseId, gradesData } = req.body;
    // gradesData: [{ studentId, scores: {...}, teacherComment }]

    if (!classId || !courseId || !gradesData || !Array.isArray(gradesData)) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const data of gradesData) {
      try {
        const { studentId, scores, teacherComment } = data;

        let grade = await Grade.findOne({
          student: studentId,
          class: classId,
          course: courseId,
        });

        if (grade) {
          grade.scores = { ...grade.scores, ...scores };
          grade.teacherComment = teacherComment || grade.teacherComment;
          grade.gradedBy = req.user._id;
          await grade.save();
        } else {
          grade = await Grade.create({
            student: studentId,
            class: classId,
            course: courseId,
            scores,
            teacherComment,
            gradedBy: req.user._id,
          });
        }

        results.success.push({
          studentId,
          gradeId: grade._id,
        });
      } catch (error) {
        results.failed.push({
          studentId: data.studentId,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Đã nhập ${results.success.length} điểm thành công, ${results.failed.length} thất bại`,
      data: results,
    });
  } catch (error) {
    console.error("Error bulk importing grades:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi nhập điểm hàng loạt",
      error: error.message,
    });
  }
};

/**
 * @desc    Get my grades (for students)
 * @route   GET /api/grades/me
 * @access  Private (student)
 */
exports.getMyGrades = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch all grades for student
    const allGrades = await Grade.find({ student: studentId })
      .populate("class", "name classCode")
      .populate("course", "name courseCode level")
      .populate("gradedBy", "fullName")
      .sort({ isPublished: -1, updatedAt: -1 });

    // Filter: only show grades that have at least one score component
    const gradesWithScores = allGrades.filter((g) => {
      const s = g.scores || {};
      return (
        (s.midterm !== null && s.midterm !== undefined) ||
        (s.final !== null && s.final !== undefined) ||
        (s.attendance !== null && s.attendance !== undefined) ||
        (s.participation !== null && s.participation !== undefined) ||
        (s.homework !== null && s.homework !== undefined)
      );
    });

    console.log(
      `📊 Found ${gradesWithScores.length}/${allGrades.length} grades with scores for student ${studentId}`
    );

    res.status(200).json({
      success: true,
      data: gradesWithScores,
    });
  } catch (error) {
    console.error("Error fetching my grades:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy điểm số",
      error: error.message,
    });
  }
};
