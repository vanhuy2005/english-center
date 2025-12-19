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
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res) => {
  try {
    const user = req.user;
    const { fullName, email, phone, address, dateOfBirth } = req.body;

    console.log("📝 UpdateMe request body:", req.body);
    console.log(
      "📝 Current user values - fullName:",
      user.fullName,
      "phone:",
      user.phone,
      "email:",
      user.email
    );

    let hasChanges = false;

    // Update allowed fields only if they are provided, not empty, and different from current
    const trimmedFullName = fullName ? fullName.trim() : "";
    if (trimmedFullName && trimmedFullName !== user.fullName) {
      user.fullName = trimmedFullName;
      hasChanges = true;
      console.log("✏️ Updating fullName to:", trimmedFullName);
    }

    const trimmedEmail = email ? email.trim() : "";
    if (trimmedEmail && trimmedEmail !== user.email) {
      // Validate email format before updating
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[A-Za-z]{2,})+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return errorResponse(res, "Email không hợp lệ", 400);
      }
      user.email = trimmedEmail;
      hasChanges = true;
      console.log("✏️ Updating email to:", trimmedEmail);
    }

    const trimmedPhone = phone ? phone.trim() : "";
    if (trimmedPhone && trimmedPhone !== user.phone) {
      // Validate phone format before updating
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        return errorResponse(res, "Số điện thoại phải có 10-11 chữ số", 400);
      }
      user.phone = trimmedPhone;
      hasChanges = true;
      console.log("✏️ Updating phone to:", trimmedPhone);
    }

    const trimmedAddress = address ? address.trim() : "";
    if (trimmedAddress !== (user.address || "")) {
      user.address = trimmedAddress;
      hasChanges = true;
      console.log("✏️ Updating address to:", trimmedAddress);
    }

    if (dateOfBirth) {
      const currentDateOfBirth = user.dateOfBirth
        ? user.dateOfBirth.toISOString().split("T")[0]
        : "";
      if (dateOfBirth !== currentDateOfBirth) {
        user.dateOfBirth = dateOfBirth;
        hasChanges = true;
        console.log("✏️ Updating dateOfBirth to:", dateOfBirth);
      }
    }

    if (!hasChanges) {
      console.log("⚠️ No changes detected");
      const profile = user.getPublicProfile();
      profile.avatar = user.avatar;
      return successResponse(res, { user: profile }, "Không có thay đổi nào");
    }

    await user.save();
    console.log("✅ User updated successfully");

    const profile = user.getPublicProfile();
    profile.avatar = user.avatar;

    successResponse(res, { user: profile }, "Cập nhật thông tin thành công");
  } catch (error) {
    console.error("❌ UpdateMe Error:", error.message);
    console.error("Error details:", {
      name: error.name,
      code: error.code,
      keyValue: error.keyValue,
      errors: error.errors ? Object.keys(error.errors) : "none",
    });

    // Handle specific validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      console.error("Validation errors:", messages);
      return errorResponse(res, messages, 400);
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const msg = `${field} này đã được sử dụng`;
      console.error("Duplicate error:", msg);
      return errorResponse(res, msg, 400);
    }

    errorResponse(res, error.message || "Lỗi cập nhật thông tin", 500);
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

/**
 * @desc    Upload user avatar
 * @route   POST /api/auth/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res) => {
  try {
    console.log("=== AVATAR UPLOAD DEBUG (AUTH) ===");
    console.log("req.user:", {
      _id: req.user._id,
      fullName: req.user.fullName,
      studentCode: req.user.studentCode,
      staffCode: req.user.staffCode,
    });

    if (!req.file) {
      return errorResponse(res, "Vui lòng chọn file ảnh", 400);
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    console.log("Avatar path:", avatarPath);
    console.log("User ID:", req.user._id);

    // Update avatar for current user (works for both Student and Staff)
    req.user.avatar = avatarPath;
    await req.user.save();

    console.log("✅ Avatar updated successfully");

    const profile = req.user.getPublicProfile();
    profile.avatar = req.user.avatar;

    successResponse(res, profile, "Tải ảnh đại diện thành công");
  } catch (error) {
    console.error("Avatar upload error:", error);
    errorResponse(res, "Không thể tải lên ảnh: " + error.message, 500);
  }
};
