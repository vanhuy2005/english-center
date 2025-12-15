const Course = require("../../shared/models/Course.model");
const ApiResponse = require("../../shared/utils/ApiResponse");

exports.getAllCourses = async (req, res) => {
  try {
    const { status, level } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (level) filter.level = level;

    const courses = await Course.find(filter);
    return ApiResponse.success(
      res,
      courses,
      "Lấy danh sách khóa học thành công"
    );
  } catch (error) {
    console.error("Get courses error:", error);
    return ApiResponse.error(res, "Không thể lấy danh sách khóa học");
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return ApiResponse.notFound(res, "Không tìm thấy khóa học");
    }

    return ApiResponse.success(
      res,
      course,
      "Lấy thông tin khóa học thành công"
    );
  } catch (error) {
    console.error("Get course error:", error);
    return ApiResponse.error(res, "Không thể lấy thông tin khóa học");
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    return ApiResponse.success(res, course, "Tạo khóa học thành công", 201);
  } catch (error) {
    console.error("Create course error:", error);
    return ApiResponse.error(res, error.message || "Không thể tạo khóa học");
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!course) {
      return ApiResponse.notFound(res, "Không tìm thấy khóa học");
    }

    return ApiResponse.success(res, course, "Cập nhật khóa học thành công");
  } catch (error) {
    console.error("Update course error:", error);
    return ApiResponse.error(
      res,
      error.message || "Không thể cập nhật khóa học"
    );
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return ApiResponse.notFound(res, "Không tìm thấy khóa học");
    }

    return ApiResponse.success(res, null, "Xóa khóa học thành công");
  } catch (error) {
    console.error("Delete course error:", error);
    return ApiResponse.error(res, "Không thể xóa khóa học");
  }
};
