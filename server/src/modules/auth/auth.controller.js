const Student = require("../../shared/models/Student.model");
const Staff = require("../../shared/models/Staff.model");
const jwtUtil = require("../../shared/utils/jwt.util");
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
  try {
    const { email, password, fullName, phone, role, ...otherFields } = req.body;

    // Validate required fields
    if (!password || !fullName || !phone || !role) {
      return errorResponse(res, "Vui lòng điền đầy đủ thông tin", 400);
    }

    // Validate role
    const allowedRoles = [
      "student",
      "teacher",
      "director",
      "academic",
      "accountant",
      "enrollment",
    ];
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, "Role không hợp lệ", 400);
    }

    let user;
    if (role === "student") {
      // Check if phone already exists
      const existing = await Student.findOne({ phone });
      if (existing) {
        return errorResponse(res, "Số điện thoại đã được sử dụng", 400);
      }

      // Create student
      user = await Student.create({
        email,
        password,
        fullName,
        phone,
        ...otherFields,
      });
    } else {
      // Staff (teacher, director, academic, accountant, enrollment)
      const existing = await Staff.findOne({ phone });
      if (existing) {
        return errorResponse(res, "Số điện thoại đã được sử dụng", 400);
      }

      user = await Staff.create({
        email,
        password,
        fullName,
        phone,
        staffType: role,
        staffCode: `NV${role.toUpperCase().slice(0, 2)}${Date.now()
          .toString()
          .slice(-6)}`,
        ...otherFields,
      });
    }

    // Generate tokens
    const tokenPayload = {
      id: user._id.toString(),
      role: role || "student",
      userType: role === "student" ? "student" : "staff",
    };

    const token = jwtUtil.generateAccessToken(tokenPayload);
    const refreshToken = jwtUtil.generateRefreshToken(tokenPayload);
    user.refreshToken = refreshToken;
    await user.save();

    successResponse(
      res,
      {
        user: user.getPublicProfile(),
        token,
        refreshToken,
      },
      "Đăng ký thành công",
      201
    );
  } catch (error) {
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

    console.log("📞 Login attempt:", { phone });

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp số điện thoại và mật khẩu",
      });
    }

    // Try to find in Student first
    let user = await Student.findOne({ phone }).select(
      "+password +refreshToken"
    );
    let userType = "student";
    let role = "student";

    // If not found in Student, try Staff
    if (!user) {
      user = await Staff.findOne({ phone }).select("+password +refreshToken");
      if (user) {
        userType = "staff";
        role = user.staffType;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Số điện thoại hoặc mật khẩu không đúng",
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Số điện thoại hoặc mật khẩu không đúng",
      });
    }

    // Check if account is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Generate tokens with plain object payload
    const tokenPayload = {
      id: user._id.toString(),
      role,
      userType,
    };

    const token = jwtUtil.generateAccessToken(tokenPayload);
    const refreshToken = jwtUtil.generateRefreshToken(tokenPayload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Build user object with all required fields
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || "",
      role, // ⚠️ MUST HAVE
      userType, // ⚠️ MUST HAVE
      status: user.status,
      isFirstLogin: user.isFirstLogin,
    };

    // Add staff-specific fields
    if (userType === "staff") {
      userData.staffCode = user.staffCode;
      userData.staffType = user.staffType;
      userData.department = user.department;
      userData.position = user.position;
    } else {
      userData.studentCode = user.studentCode;
      userData.academicStatus = user.academicStatus;
    }

    console.log("✅ Login successful:", {
      userId: user._id,
      role,
      userType,
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
    });

    // ⚠️ IMPORTANT: Response format MUST match client expectation
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token,
        refreshToken,
        user: userData,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
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
 * @desc    Get current user info
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is already populated by auth middleware
    const user = req.user;
    const role = user.studentCode ? "student" : user.staffType;

    const profile = user.getPublicProfile();
    profile.avatar = user.avatar;

    successResponse(
      res,
      {
        user: profile,
        role,
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

    // Get user with password (try both Student and Staff)
    let user = await Student.findById(req.user._id).select("+password");
    if (!user) {
      user = await Staff.findById(req.user._id).select("+password");
    }

    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

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
    user.isFirstLogin = false;
    user.refreshToken = null;
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

    // Find user with refresh token (try both Student and Staff)
    let user = await Student.findOne({ refreshToken }).select("+refreshToken");
    let userType = "student";
    let role = "student";

    if (!user) {
      user = await Staff.findOne({ refreshToken }).select("+refreshToken");
      if (user) {
        userType = "staff";
        role = user.staffType;
      }
    }

    if (!user) {
      return errorResponse(res, "Invalid refresh token", 401);
    }

    // Generate new tokens with proper payload
    const tokenPayload = {
      id: user._id.toString(),
      role,
      userType,
    };

    const newToken = jwtUtil.generateAccessToken(tokenPayload);
    const newRefreshToken = jwtUtil.generateRefreshToken(tokenPayload);

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
