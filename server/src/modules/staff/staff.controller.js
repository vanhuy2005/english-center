const Staff = require("../../shared/models/Staff.model");
const ApiResponse = require("../../shared/utils/ApiResponse");

// Get all staffs
exports.getAllStaffs = async (req, res) => {
  try {
    const { staffType, employmentStatus } = req.query;

    const filter = {};
    if (staffType) filter.staffType = staffType;
    if (employmentStatus) filter.employmentStatus = employmentStatus;

    const staffs = await Staff.find(filter).select("-password -refreshToken");

    return ApiResponse.success(
      res,
      staffs,
      "Lấy danh sách nhân viên thành công"
    );
  } catch (error) {
    console.error("Get staffs error:", error);
    return ApiResponse.error(res, "Không thể lấy danh sách nhân viên");
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select(
      "-password -refreshToken"
    );

    if (!staff) {
      return ApiResponse.error(res, "Không tìm thấy nhân viên", 404);
    }

    return ApiResponse.success(
      res,
      staff,
      "Lấy thông tin nhân viên thành công"
    );
  } catch (error) {
    console.error("Get staff error:", error);
    return ApiResponse.error(res, "Không thể lấy thông tin nhân viên");
  }
};

// Create staff
exports.createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    const publicProfile = staff.getPublicProfile();

    return ApiResponse.success(
      res,
      publicProfile,
      "Tạo nhân viên thành công",
      201
    );
  } catch (error) {
    console.error("Create staff error:", error);
    return ApiResponse.error(res, error.message || "Không thể tạo nhân viên");
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!staff) {
      return ApiResponse.error(res, "Không tìm thấy nhân viên", 404);
    }

    return ApiResponse.success(res, staff, "Cập nhật nhân viên thành công");
  } catch (error) {
    console.error("Update staff error:", error);
    return ApiResponse.error(
      res,
      error.message || "Không thể cập nhật nhân viên"
    );
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return ApiResponse.error(res, "Không tìm thấy nhân viên", 404);
    }

    return ApiResponse.success(res, null, "Xóa nhân viên thành công");
  } catch (error) {
    console.error("Delete staff error:", error);
    return ApiResponse.error(res, "Không thể xóa nhân viên");
  }
};
