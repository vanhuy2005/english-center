const User = require("../../shared/models/User.model");
const Student = require("../../shared/models/Student.model");
const Teacher = require("../../shared/models/Teacher.model");
const {
  generateToken,
  generateRefreshToken,
} = require("../../shared/utils/jwt.util");
const {
  successResponse,
  errorResponse,
} = require("../../shared/utils/response.util");

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  const mongoose = require("mongoose");
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, password, fullName, phone, role } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Vui lòng điền đầy đủ thông tin", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Email đã được sử dụng", 400);
    }

    // Validate role
    const allowedRoles = ["student", "teacher", "director"];
    if (!allowedRoles.includes(role)) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Role không hợp lệ", 400);
    }

    // Create user
    const userArr = await User.create(
      [
        {
          email,
          password,
          fullName,
          phone,
          role,
        },
      ],
      { session }
    );
    const user = userArr[0];

    // Create role-specific profile
    // Whitelist and sanitize allowed profile fields
    let profileArr;
    if (role === "student") {
      const allowedStudentFields = [
        "dateOfBirth",
        "gender",
        "address",
        "contactPerson",
        "contactInfo",
        "academicStatus",
      ];
      const studentProfile = { user: user._id };
      allowedStudentFields.forEach((field) => {
        if (req.body[field] !== undefined)
          studentProfile[field] = req.body[field];
      });
      profileArr = await Student.create([studentProfile], { session });
    } else if (role === "teacher") {
      const allowedTeacherFields = [
        "dateOfBirth",
        "gender",
        "address",
        "subjects",
        "employmentStatus",
        "contactInfo",
      ];
      const teacherProfile = { user: user._id };
      allowedTeacherFields.forEach((field) => {
        if (req.body[field] !== undefined)
          teacherProfile[field] = req.body[field];
      });
      profileArr = await Teacher.create([teacherProfile], { session });
    }
    const profile = profileArr ? profileArr[0] : null;

    // Generate refresh token and save to user inside transaction
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Generate access token
    const token = generateToken(user._id);

    // Response
    successResponse(
      res,
      {
        user: user.getPublicProfile(),
        profile,
        token,
        refreshToken,
      },
      "Đăng ký thành công",
      201
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Register Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Login user with phone number
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate
    if (!phone || !password) {
      return errorResponse(res, "Vui lòng nhập số điện thoại và mật khẩu", 400);
    }

    // Find user with password field
    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return errorResponse(res, "Số điện thoại hoặc mật khẩu không đúng", 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, "Số điện thoại hoặc mật khẩu không đúng", 401);
    }

    // Check if user is active
    if (user.status !== "active") {
      return errorResponse(res, "Tài khoản đã bị khóa", 403);
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Get role-specific profile
    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user: user._id }).populate(
        "enrolledCourses"
      );
    } else if (user.role === "teacher") {
      profile = await Teacher.findOne({ user: user._id }).populate("classes");
    }

    // Response
    successResponse(
      res,
      {
        user: user.getPublicProfile(),
        profile,
        token,
        refreshToken,
        isFirstLogin: user.isFirstLogin, // Gửi thông tin đăng nhập lần đầu
      },
      "Đăng nhập thành công"
    );
  } catch (error) {
    console.error("Login Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    // Clear refresh token
    req.user.refreshToken = null;
    await req.user.save();

    successResponse(res, null, "Đăng xuất thành công");
  } catch (error) {
    console.error("Logout Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );

    // Get role-specific profile
    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === "teacher") {
      profile = await Teacher.findOne({ user: user._id });
    }

    successResponse(
      res,
      { user, profile, role: user.role },
      "Lấy thông tin thành công"
    );
  } catch (error) {
    console.error("Get Me Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
/**
 * @desc    Get current user info
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get role-specific profile
    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user: user._id }).populate(
        "enrolledCourses"
      );
    } else if (user.role === "teacher") {
      profile = await Teacher.findOne({ user: user._id }).populate("classes");
    }

    successResponse(
      res,
      {
        user: user.getPublicProfile(),
        profile,
      },
      "Lấy thông tin thành công"
    );
  } catch (error) {
    console.error("GetMe Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Change password (for first login or anytime)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, isFirstLogin } = req.body;

    // Validate
    if (!newPassword || newPassword.length < 6) {
      return errorResponse(res, "Mật khẩu mới phải có ít nhất 6 ký tự", 400);
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Nếu không phải đăng nhập lần đầu, cần kiểm tra mật khẩu hiện tại
    if (!isFirstLogin) {
      if (!currentPassword) {
        return errorResponse(res, "Vui lòng nhập mật khẩu hiện tại", 400);
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return errorResponse(res, "Mật khẩu hiện tại không đúng", 401);
      }
    }

    // Update password
    user.password = newPassword;
    user.isFirstLogin = false; // Đánh dấu đã đổi mật khẩu lần đầu
    user.refreshToken = null; // Clear refresh token để bắt đăng nhập lại
    await user.save();

    successResponse(res, null, "Đổi mật khẩu thành công");
  } catch (error) {
    console.error("Change Password Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, "Refresh token is required", 400);
    }

    // Find user with refresh token
    const user = await User.findOne({ refreshToken }).select("+refreshToken");
    if (!user) {
      return errorResponse(res, "Invalid refresh token", 401);
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    successResponse(
      res,
      {
        token: newToken,
        refreshToken: newRefreshToken,
      },
      "Token refreshed successfully"
    );
  } catch (error) {
    console.error("Refresh Token Error:", error);
    errorResponse(res, error.message, 500);
  }
};
