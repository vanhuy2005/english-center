const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load biến môi trường
dotenv.config();

// --- IMPORT MODELS ---
const Student = require("./src/shared/models/Student.model");
const Course = require("./src/shared/models/Course.model");
const Class = require("./src/shared/models/Class.model");
const Attendance = require("./src/shared/models/Attendance.model");
const Grade = require("./src/shared/models/Grade.model");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/english-center-db";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔌 Đã kết nối MongoDB...");

    const testPhone = "0999888777";
    const rawPassword = "123456";

    // 1. Dọn dẹp dữ liệu cũ
    const existingStudent = await Student.findOne({ phone: testPhone });
    if (existingStudent) {
      console.log("🧹 Đang xóa dữ liệu cũ...");
      await Grade.deleteMany({ student: existingStudent._id });
      await Attendance.deleteMany({ student: existingStudent._id });
      await Class.updateMany(
        {},
        { $pull: { students: { student: existingStudent._id } } }
      );
      await Student.deleteOne({ _id: existingStudent._id });
    }

    // 2. Tạo Học viên
    console.log("👤 Đang tạo học viên mới...");
    const newStudent = new Student({
      fullName: "Nguyễn Văn Test (Dashboard)",
      phone: testPhone,
      email: "student_test@example.com",
      password: rawPassword,
      dateOfBirth: new Date("2000-01-01"),
      gender: "male",
      address: "TP. Hồ Chí Minh",
      status: "active",
    });

    await newStudent.save();
    console.log(`✅ Đã tạo học viên ID: ${newStudent._id}`);

    // 3. Kiểm tra mật khẩu (Self-Check)
    console.log("🕵️‍♂️ Đang tự kiểm tra mật khẩu...");
    try {
      const checkUser = await Student.findById(newStudent._id).select(
        "+password"
      );
      if (checkUser && typeof checkUser.comparePassword === "function") {
        const isMatch = await checkUser.comparePassword(rawPassword);
        if (isMatch) console.log("✅ KIỂM TRA PASS: THÀNH CÔNG");
        else console.error("❌ KIỂM TRA PASS: THẤT BẠI");
      }
    } catch (err) {}

    // 4. Tạo Khóa học (Đã fix lỗi thiếu Level)
    let course = await Course.findOne({ code: "IELTS-SEED" });
    if (!course) {
      console.log("📚 Đang tạo khóa học mẫu...");
      course = await Course.create({
        name: "IELTS Foundation (Dữ liệu mẫu)",
        code: "IELTS-SEED",
        tuition: 5000000,
        fee: { amount: 5000000, currency: "VND" },
        duration: { hours: 60, weeks: 12 },
        startDate: new Date(),
        status: "active",
        // --- FIX LỖI VALIDATION ---
        level: "intermediate", // Bắt buộc phải có
        description: "Khóa học mẫu cho dashboard",
        // --------------------------
      });
    }

    // 5. Tạo Lớp học
    let cls = await Class.findOne({ classCode: "SEED-01" });
    if (!cls) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);

      cls = await Class.create({
        name: "Lớp IELTS Sáng 2-4-6",
        classCode: "SEED-01",
        course: course._id,
        startDate: startDate,
        endDate: endDate,
        status: "active",
        schedule: [
          {
            day: "Monday",
            startTime: "08:00",
            endTime: "10:00",
            room: "Online",
          },
          {
            day: "Wednesday",
            startTime: "08:00",
            endTime: "10:00",
            room: "Online",
          },
          {
            day: "Friday",
            startTime: "08:00",
            endTime: "10:00",
            room: "Online",
          },
        ],
        students: [],
      });
    }

    const isEnrolled = cls.students.some(
      (s) => s.student.toString() === newStudent._id.toString()
    );
    if (!isEnrolled) {
      cls.students.push({
        student: newStudent._id,
        status: "active",
        enrollmentDate: new Date(),
      });
      await cls.save();
    }

    // 6. Tạo Điểm danh
    console.log("📅 Đang tạo dữ liệu điểm danh...");
    const attendanceData = [
      { status: "present", date: new Date(Date.now() - 86400000 * 7) },
      { status: "present", date: new Date(Date.now() - 86400000 * 5) },
      { status: "present", date: new Date(Date.now() - 86400000 * 3) },
      { status: "absent", date: new Date(Date.now() - 86400000 * 1) },
    ];

    for (const att of attendanceData) {
      await Attendance.create({
        student: newStudent._id,
        class: cls._id,
        date: att.date,
        status: att.status,
        scheduleId: null,
      });
    }

    // 7. Tạo Điểm số
    console.log("🎓 Đang tạo bảng điểm...");
    await Grade.create({
      student: newStudent._id,
      class: cls._id,
      course: course._id,
      scores: { midterm: 8.5, final: 9.0, homework: 8.0 },
      totalScore: 8.7,
      letterGrade: "A",
      isPublished: true,
      gradedBy: null,
    });

    console.log("\n==========================================");
    console.log("🎉 KHỞI TẠO DỮ LIỆU THÀNH CÔNG!");
    console.log("👉 Tài khoản đăng nhập:");
    console.log(`📱 Số điện thoại: ${testPhone}`);
    console.log(`🔑 Mật khẩu: ${rawPassword}`);
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi chạy script:", error);
    process.exit(1);
  }
};

seedData();
