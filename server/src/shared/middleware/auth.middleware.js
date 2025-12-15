const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff.model");
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
    const staff = await Staff.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!staff || staff.status !== "active") {
      return ApiResponse.unauthorized(res, "Tài khoản không hợp lệ");
    }

    req.user = staff;
    next();
  } catch (error) {
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

    if (!roles.includes(req.user.staffType)) {
      return ApiResponse.error(res, "Không có quyền truy cập", 403);
    }

    next();
  };
};

module.exports = { authenticate, protect, authorize };
