const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Student = require("../src/shared/models/Student.model");
const Staff = require("../src/shared/models/Staff.model");

// Login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    console.log("Login attempt:", { phone });

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

    // Generate tokens - Use REFRESH_TOKEN_SECRET from .env
    const token = jwt.sign(
      { id: user._id, role, userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role, userType },
      process.env.REFRESH_TOKEN_SECRET, // Changed from JWT_REFRESH_SECRET
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d" }
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Get public profile
    const profile = user.getPublicProfile();

    console.log("Login successful:", { userId: user._id, role, userType });

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token,
        refreshToken,
        user: {
          ...profile,
          role,
          userType,
        },
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    let user;
    if (decoded.userType === "student") {
      user = await Student.findById(decoded.id).select(
        "-password -refreshToken"
      );
    } else {
      user = await Staff.findById(decoded.id).select("-password -refreshToken");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      message: "Lấy thông tin thành công",
      data: {
        user: {
          ...user.toObject(),
          role: decoded.role,
          userType: decoded.userType,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
      error: error.message,
    });
  }
});

// Change password
router.put("/change-password", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("/auth/change-password called", {
      hasAuthHeader: !!token,
      body: {
        ...req.body,
        currentPassword: req.body.currentPassword ? "[PROVIDED]" : undefined,
      },
    });

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      isFirstLogin: clientFirstLogin,
    } = req.body;

    let user;
    if (decoded.userType === "student") {
      user = await Student.findById(decoded.id).select("+password");
    } else {
      user = await Staff.findById(decoded.id).select("+password");
    }

    console.log("Change-password: decoded", {
      id: decoded.id,
      userType: decoded.userType,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Validate new password and confirmation
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu xác nhận không khớp",
      });
    }

    // Determine whether this is the user's first login from DB (not client-sent flag)
    // Determine first-login status (allow client to signal first-login as fallback)
    const firstLogin = !!user.isFirstLogin || !!clientFirstLogin;
    console.log("Change-password: user.isFirstLogin =", firstLogin);

    // If not first login, verify current password
    if (!firstLogin) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mật khẩu hiện tại",
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng",
        });
      }
    }

    // Update password and mark first login complete
    user.password = newPassword;
    user.isFirstLogin = false;
    user.refreshToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đổi mật khẩu",
      error: error.message,
    });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      let user;
      if (decoded.userType === "student") {
        user = await Student.findById(decoded.id);
      } else {
        user = await Staff.findById(decoded.id);
      }

      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    res.json({
      success: true,
      message: "Đăng xuất thành công",
    });
  }
});

module.exports = router;
