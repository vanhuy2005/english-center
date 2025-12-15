const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff.model");
const Student = require("../models/Student.model");
const ApiResponse = require("../utils/ApiResponse");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return ApiResponse.unauthorized(res, "Token không được cung cấp");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Try Staff first
    let user = await Staff.findById(decoded.id).select(
      "-password -refreshToken"
    );
    let userType = "staff";

    // If not found, try Student
    if (!user) {
      user = await Student.findById(decoded.id).select(
        "-password -refreshToken"
      );
      userType = "student";
    }

    if (!user || user.status !== "active") {
      return ApiResponse.unauthorized(res, "Tài khoản không hợp lệ");
    }

    req.user = user;
    req.userType = userType;
    req.role =
      decoded.role || (userType === "staff" ? user.staffType : "student");
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return ApiResponse.unauthorized(res, "Token không hợp lệ hoặc đã hết hạn");
  }
};

// Alias for backward compatibility
const protect = authenticate;

// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "Chưa đăng nhập");
    }

    const userRole = req.role || req.user.staffType || req.userType;
    if (!roles.includes(userRole)) {
      return ApiResponse.error(
        res,
        `Không có quyền truy cập. Required: ${roles.join(", ")}`,
        403
      );
    }

    next();
  };
};

module.exports = { authenticate, protect, authorize };
