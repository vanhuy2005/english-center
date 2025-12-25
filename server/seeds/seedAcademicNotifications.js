/* SEED SCRIPT - ACADEMIC STAFF NOTIFICATIONS
   Mục tiêu: Tạo một số thông báo mẫu cho Nhân viên Học vụ (staffType: "academic") để hiển thị trên trang Notifications.
   Cách dùng: node server/seeds/seedAcademicNotifications.js
*/

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Staff = require("../src/shared/models/Staff.model");
const Student = require("../src/shared/models/Student.model");
const Notification = require("../src/shared/models/Notification.model");

const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/english-center-db";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

async function ensureAcademicStaff() {
  // Use plain default password so Mongoose pre-save hook hashes it once
  const defaultPassword = "123456";

  let staff = await Staff.findOne({ staffCode: "NV-ACA001" });
  if (!staff) {
    staff = new Staff({
      staffCode: "NV-ACA001",
      fullName: "Nguyễn Văn Học Vụ",
      phone: "0903000022",
      password: defaultPassword,
      staffType: "academic",
      status: "active",
      dateOfBirth: new Date("1990-01-01"),
      address: "Phòng Học vụ",
    });
    await staff.save();
    console.log("✅ Created Academic staff: NV-ACA001 (pw: 123456)");
  } else {
    staff.fullName = "Nguyễn Văn Học Vụ";
    staff.password = defaultPassword;
    staff.status = "active";
    await staff.save();
    console.log("ℹ️  Academic staff already exists - updated password and name");
  }
  return staff;
}

async function ensureStudents() {
  const students = await Student.find().limit(6);
  if (students.length > 0) return students;

  // Nếu chưa có students, tạo một vài students mẫu để dùng trong message
  const sample = [
    { fullName: "Nguyễn Văn A", email: "student_a@test.com", phone: "0901112001" },
    { fullName: "Trần Thị B", email: "student_b@test.com", phone: "0901112002" },
    { fullName: "Lê Văn C", email: "student_c@test.com", phone: "0901112003" },
  ];

  const created = [];
  for (const s of sample) {
    let st = await Student.findOne({ email: s.email });
    if (!st) {
      st = new Student({
        studentCode: `HV${Math.floor(2000 + Math.random() * 1000)}`,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        status: "active",
      });
      await st.save();
      console.log(`✅ Created sample student ${s.fullName}`);
    }
    created.push(st);
  }
  return created;
}

async function seedNotifications() {
  await connectDB();

  const staff = await ensureAcademicStaff();
  const students = await ensureStudents();

  console.log("🔔 Seeding notifications for:", staff.fullName);

  // Xoá các notification cũ (chỉ cho staff này) để tránh trùng lặp khi chạy lại
  await Notification.deleteMany({ recipient: staff._id });

  const now = new Date();
  const notifications = [
    {
      recipient: staff._id,
      type: "grade_published",
      title: "Điểm giữa kỳ đã được công bố: Lớp TOEIC Advanced",
      message: `Bảng điểm giữa kỳ của lớp TOEIC Advanced đã được cập nhật. Hãy kiểm tra và thông báo cho học viên.`,
      link: "/staff/academic/grades",
      relatedModel: "Class",
      priority: "normal",
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), // 2 ngày trước
    },
    {
      recipient: staff._id,
      type: "request_response",
      title: `Yêu cầu học vụ: ${students[0].fullName} - Xin chuyển lớp`,
      message: `${students[0].fullName} đã gửi yêu cầu chuyển lớp. Vui lòng xử lý yêu cầu.`,
      link: "/staff/academic/requests",
      relatedModel: "Request",
      priority: "high",
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4), // 4 giờ trước
    },
    {
      recipient: staff._id,
      type: "attendance_alert",
      title: `Cảnh báo vắng mặt: ${students[1].fullName}`,
      message: `${students[1].fullName} đã vắng 2 buổi liên tiếp. Hãy theo dõi.`,
      link: "/staff/academic/attendance",
      relatedModel: "Attendance",
      priority: "urgent",
      isRead: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60), // 1 giờ trước
    },
    {
      recipient: staff._id,
      type: "payment_reminder",
      title: `Nhắc học phí: ${students[2].fullName}`,
      message: `${students[2].fullName} có khoản học phí chưa thanh toán. Kiểm tra công nợ.`,
      link: "/staff/academic/finance",
      relatedModel: "Finance",
      priority: "normal",
      isRead: true,
      readAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 phút trước
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6), // 6 giờ trước
    },
    {
      recipient: staff._id,
      type: "system",
      title: "Bảo trì hệ thống vào 23:00 hôm nay",
      message: "Hệ thống sẽ bảo trì định kỳ từ 23:00 đến 23:30. Một số chức năng có thể tạm thời bị gián đoạn.",
      link: null,
      priority: "low",
      isRead: true,
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7), // hết hạn trong 7 ngày
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12), // 12 giờ trước
    },
    {
      recipient: staff._id,
      type: "announcement",
      title: "Thông báo: Họp nội bộ Phòng Học vụ",
      message: "Họp nội bộ Phòng Học vụ vào Thứ 2, 09:00 tại phòng họp A. Tất cả nhân viên học vụ có mặt.",
      link: "/staff/academic/calendar",
      priority: "normal",
      isRead: false,
      createdAt: now,
    },
  ];

  await Notification.insertMany(notifications);

  console.log(`✅ Đã tạo ${notifications.length} thông báo cho ${staff.staffCode} (${staff.fullName})`);
  console.log("👉 Chạy lại trang Notifications của Học vụ để kiểm tra dữ liệu mẫu.");

  process.exit(0);
}

seedNotifications().catch((err) => {
  console.error("❌ Seeding error:", err);
  process.exit(1);
});
