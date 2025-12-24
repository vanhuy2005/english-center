require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow localhost origins in development
      if (process.env.NODE_ENV === "development") {
        if (origin.match(/^http:\/\/localhost:\d+$/)) {
          return callback(null, true);
        }
      }

      // Allow the configured CLIENT_URL
      const allowedOrigins = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers.authorization);
  next();
});

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Async initialization for DB connection
async function initApp() {
  try {
    await connectDB();
    return app;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Create uploads directory if not exists
const fs = require("fs");
const uploadsDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Import routes
const authRoutes = require("./modules/auth/auth.routes");
const staffRoutes = require("./modules/staff/staff.routes");
const academicRoutes = require("./modules/staff/academic/academic.routes");
const accountantRoutes = require("./modules/staff/accountant/accountant.routes");
const courseRoutes = require("./modules/course/course.routes");
const studentRoutes = require("./modules/student/student.routes");
const teacherRoutes = require("./modules/teacher/teacher.routes");
const directorController = require("./modules/director/director.controller");
const receiptRoutes = require("../routes/receipts");

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/staff/academic", academicRoutes);
app.use("/api/staff/accountant", accountantRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/receipts", receiptRoutes);

// Expose report endpoints at /reports/* matching client calls
app.get("/reports/revenue-chart", directorController.getRevenueChart);
app.get("/reports/attendance-chart", directorController.getAttendanceChart);
app.get(
  "/reports/student-distribution",
  directorController.getStudentDistribution
);
app.get("/reports/recent-activities", directorController.getRecentActivities);
// Also expose the same report endpoints under /api/reports for clients that include /api prefix
app.get("/api/reports/revenue-chart", directorController.getRevenueChart);
app.get("/api/reports/attendance-chart", directorController.getAttendanceChart);
app.get(
  "/api/reports/student-distribution",
  directorController.getStudentDistribution
);
app.get(
  "/api/reports/recent-activities",
  directorController.getRecentActivities
);
app.use("/api/classes", require("./modules/class/class.routes"));
app.use("/api/schedules", require("./modules/schedule/schedule.routes"));
app.use("/api/attendance", require("./modules/attendance/attendance.routes"));
app.use("/api/grades", require("./modules/grade/grade.routes"));
app.use("/api/requests", require("./modules/request/request.routes"));
app.use(
  "/api/notifications",
  require("./modules/notification/notification.routes")
);
app.use("/api/finance", require("./modules/finance/finance.routes"));
app.use("/api/director", require("./modules/director/director.routes"));
app.use(
  "/api/staff/enrollment",
  require("./modules/staff/enrollment/enrollment.routes")
);
app.use(
  "/api/staff/academic",
  require("./modules/staff/academic/academic.routes")
);
app.use(
  "/api/staff/academic/requests",
  require("./modules/staff/academic/request.routes")
);
app.use("/api/receipts", require("../routes/receipts"));
// Mount legacy/student enrollment routes (development convenience)
// Mount student request routes (handles course-enrollment requests and student requests)
app.use("/api/student", require("./modules/student/request.routes"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler (must be last)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Export async initializer
module.exports = { app, initApp };
