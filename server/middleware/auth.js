const jwt = require("jsonwebtoken");
const Student = require("../src/shared/models/Student.model");
const Staff = require("../src/shared/models/Staff.model");

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("🔐 Auth Check - Token present:", !!token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập. Vui lòng đăng nhập.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    console.log("✅ Token decoded:", { id: decoded.id, role: decoded.role });

    // Try to find user in Student collection first
    let user = await Student.findById(decoded.id).select(
      "-password -refreshToken"
    );
    let userType = "student";
    let role = decoded.role || "student";

    // If not found in Student, try Staff collection
    if (!user) {
      user = await Staff.findById(decoded.id).select("-password -refreshToken");
      if (user) {
        userType = "staff";
        role = decoded.role || user.staffType;
      }
    }

    if (!user) {
      console.log("❌ User not found with ID:", decoded.id);
      return res.status(401).json({
        success: false,
        message: "Tài khoản không hợp lệ",
      });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    req.user = user;
    req.userType = userType;
    req.role = role;

    console.log("✅ Auth passed for user:", { id: user._id, role });
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
      error: error.message,
    });
  }
};

// Check user role
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    if (roles.length && !roles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${
          req.role
        } không có quyền truy cập. Required: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

// Optional auth - not required but will set req.user if token is valid
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      // Try Student first
      let user = await Student.findById(decoded.id || decoded._id).select(
        "-password -refreshToken"
      );
      let userType = "student";
      let role = "student";

      // If not found, try Staff
      if (!user) {
        user = await Staff.findById(decoded.id || decoded._id).select(
          "-password -refreshToken"
        );
        if (user) {
          userType = "staff";
          role = user.staffType;
        }
      }

      if (user && user.status === "active") {
        req.user = user;
        req.userType = userType;
        req.role = role;
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

module.exports = {
  auth,
  checkRole,
  optionalAuth,
};
