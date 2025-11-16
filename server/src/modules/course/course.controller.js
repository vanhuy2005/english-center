const Course = require("../../shared/models/Course.model");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../../shared/utils/response.util");

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
exports.getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      level = "",
      status = "active",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { courseCode: { $regex: search, $options: "i" } },
      ];
    }

    if (level) query.level = level;
    if (status) query.status = status;

    // Count total
    const total = await Course.countDocuments(query);

    // Execute query
    const courses = await Course.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    paginatedResponse(
      res,
      courses,
      page,
      pageSize,
      total,
      "Lấy danh sách khóa học thành công"
    );
  } catch (error) {
    console.error("Get All Courses Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("prerequisites", "name courseCode");

    if (!course) {
      return errorResponse(res, "Không tìm thấy khóa học", 404);
    }

    successResponse(res, course, "Lấy thông tin khóa học thành công");
  } catch (error) {
    console.error("Get Course Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Private (director, academic)
 */
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);

    successResponse(res, course, "Tạo khóa học thành công", 201);
  } catch (error) {
    console.error("Create Course Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (director, academic)
 */
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return errorResponse(res, "Không tìm thấy khóa học", 404);
    }

    successResponse(res, course, "Cập nhật khóa học thành công");
  } catch (error) {
    console.error("Update Course Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (director only)
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return errorResponse(res, "Không tìm thấy khóa học", 404);
    }

    successResponse(res, null, "Xóa khóa học thành công");
  } catch (error) {
    console.error("Delete Course Error:", error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = exports;
