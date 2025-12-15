require("dotenv").config();
const connectDB = require("./src/config/database");
const { initApp } = require("./src/app");

// Kết nối MongoDB và khởi động server chỉ sau khi DB đã sẵn sàng
const PORT = process.env.PORT || 5000;
let server;

(async () => {
  try {
    await connectDB();
    const app = await initApp();

    // Import routes
    const authRoutes = require("./routes/auth");
    const receiptRoutes = require("./routes/receipts");
    const staffRoutes = require("./routes/staff");

    // Use routes
    app.use("/api/auth", authRoutes);
    app.use("/api/receipts", receiptRoutes);
    app.use("/api/staff", staffRoutes);

    server = app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(` API URL: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" Database connection or server startup failed:", err);
    process.exit(1);
  }
})();

// Graceful shutdown logic
let isShuttingDown = false;
function gracefulShutdown(err) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  const exitCode = err ? 1 : 0;
  if (err) {
    console.error(" Unhandled Rejection:", err);
  }
  console.log("Initiating graceful shutdown...");
  if (server && typeof server.close === "function") {
    server.close(() => {
      console.log("Server closed. Exiting process.");
      process.exit(exitCode);
    });
    setTimeout(() => {
      console.error("Force exiting after 10s timeout.");
      process.exit(exitCode);
    }, 10000).unref();
  } else {
    console.log("No server to close. Exiting process.");
    process.exit(exitCode);
  }
}

process.on("unhandledRejection", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
