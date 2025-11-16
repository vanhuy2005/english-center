const jwt = require("jsonwebtoken");
const Student = require("../models/Student.model");
const Staff = require("../models/Staff.model");

// Validate JWT_SECRET at module initialization
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined in environment variables. Please set JWT_SECRET before starting the server."
  );
}

/**
 * Protect routes - Verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập. Vui lòng đăng nhập.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (try Student first, then Staff)
    let user = await Student.findById(decoded.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      user = await Staff.findById(decoded.id).select("-password -refreshToken");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại.",
      });
    }

    // Set user in request
    req.user = user;

    // Check if user is active
    if (req.user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa.",
      });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi xác thực.",
    });
  }
};

/**
 * Authorize roles
 * @param  {Array|string} roles - Allowed roles
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Không có thông tin xác thực người dùng.",
      });
    }

    // Determine role: student or staffType
    const userRole = req.user.studentCode ? "student" : req.user.staffType;

    // Handle both array and single role
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role ${userRole} không có quyền truy cập. Yêu cầu: ${allowedRoles.join(
          ", "
        )}`,
      });
    }
    next();
  };
};

/**
 * Optional auth - doesn't fail if no token
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = await Student.findById(decoded.id).select(
        "-password -refreshToken"
      );
      if (!user) {
        user = await Staff.findById(decoded.id).select(
          "-password -refreshToken"
        );
      }
      if (user && user.status === "active") {
        req.user = user;
      } else {
        req.user = undefined;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
