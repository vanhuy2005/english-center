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

// Module Routes
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/students", require("./modules/student/student.routes"));
app.use("/api/student/requests", require("./modules/student/request.routes"));
app.use("/api/teachers", require("./modules/teacher/teacher.routes"));
app.use("/api/courses", require("./modules/course/course.routes"));
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
app.use(
  "/api/staff/accountant",
  require("./modules/staff/accountant/accountant.routes")
);

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
