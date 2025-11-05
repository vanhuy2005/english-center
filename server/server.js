require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/leave-requests", require("./routes/leaveRequests"));
app.use("/api/makeup-classes", require("./routes/makeupClasses"));
app.use("/api/schedules", require("./routes/schedules"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route không tồn tại" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
