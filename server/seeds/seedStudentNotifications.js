/* SEED SCRIPT - STUDENT NOTIFICATIONS
   Mục tiêu: Tạo thông báo mẫu cho học viên để hiển thị trong student portal
   Cách dùng: node server/seeds/seedStudentNotifications.js
*/

require("dotenv").config();
const mongoose = require("mongoose");

const Student = require("../src/shared/models/Student.model");
const Notification = require("../src/shared/models/Notification.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

async function seedNotifications() {
  await connectDB();

  // Lấy tất cả students
  const students = await Student.find({ status: "active" }).limit(10);

  if (students.length === 0) {
    console.log("❌ No students found. Please run seedStudent.js first.");
    process.exit(1);
  }

  console.log(`🔔 Seeding notifications for ${students.length} students...`);

  const now = new Date();

  // Tạo notification templates
  const notificationTemplates = [
    {
      type: "announcement",
      title: "Chào mừng bạn đến với trung tâm",
      message:
        "Chào mừng bạn đến với trung tâm Tiếng Anh. Chúc bạn học tập tốt!",
      priority: "normal",
      link: null,
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3), // 3 ngày trước
    },
    {
      type: "class_schedule",
      title: "Lịch học tuần tới",
      message:
        "Lớp học của bạn sẽ bắt đầu vào thứ Hai, 8:00 AM. Vui lòng đến đúng giờ.",
      priority: "high",
      link: "/student/schedule",
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1), // 1 ngày trước
    },
    {
      type: "grade_published",
      title: "Điểm kiểm tra đã được công bố",
      message:
        "Điểm bài kiểm tra giữa kỳ của bạn đã được cập nhật. Hãy kiểm tra kết quả.",
      priority: "normal",
      link: "/student/grades",
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12), // 12 giờ trước
    },
    {
      type: "payment_reminder",
      title: "Nhắc nhở học phí",
      message:
        "Học phí tháng này sẽ đến hạn vào ngày 30. Vui lòng thanh toán đúng hạn.",
      priority: "high",
      link: "/student/finance",
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6), // 6 giờ trước
    },
    {
      type: "attendance_alert",
      title: "Thông báo điểm danh",
      message:
        "Bạn đã vắng mặt 1 buổi học. Hãy chú ý tham gia đầy đủ để đạt kết quả tốt.",
      priority: "normal",
      link: "/student/attendance",
      isRead: true,
      readAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), // 2 ngày trước
    },
    {
      type: "request_response",
      title: "Yêu cầu đã được xử lý",
      message:
        "Yêu cầu chuyển lớp của bạn đã được chấp nhận. Kiểm tra lịch học mới.",
      priority: "normal",
      link: "/student/requests",
      isRead: true,
      readAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5), // 5 ngày trước
    },
    {
      type: "system",
      title: "Cập nhật hệ thống",
      message:
        "Hệ thống đã được cập nhật với các tính năng mới. Khám phá ngay!",
      priority: "low",
      link: null,
      isRead: true,
      readAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7), // 7 ngày trước
    },
  ];

  let totalCreated = 0;

  for (const student of students) {
    // Xóa notifications cũ của student
    await Notification.deleteMany({ recipient: student._id });

    // Tạo 3-5 notifications ngẫu nhiên cho mỗi student
    const numNotifications = Math.floor(Math.random() * 3) + 3; // 3-5 notifications
    const selectedTemplates = notificationTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, numNotifications);

    for (const template of selectedTemplates) {
      await Notification.create({
        ...template,
        recipient: student._id,
      });
      totalCreated++;
    }

    console.log(
      `✅ Created ${numNotifications} notifications for ${student.fullName}`
    );
  }

  console.log(
    `\n✅ Successfully created ${totalCreated} notifications for ${students.length} students`
  );
  console.log("🎉 Seed completed!");

  process.exit(0);
}

seedNotifications().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
