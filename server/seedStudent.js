const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./src/shared/models/User.model");
const Course = require("./src/shared/models/Course.model");
const Class = require("./src/shared/models/Class.model");
const Attendance = require("./src/shared/models/Attendance.model");
const Grade = require("./src/shared/models/Grade.model");
const Schedule = require("./src/shared/models/Schedule.model");
const Payment = require("./src/shared/models/Finance.model");
const Notification = require("./src/shared/models/Notification.model");

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/english-center"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function seedStudentData() {
  try {
    console.log("🌱 Starting student data seeding...");

    // 1. Create a test student user
    console.log("👤 Creating student user...");
    let studentUser = await User.findOne({ phone: "0901234567" });
    if (!studentUser) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      studentUser = await User.create({
        username: "student01",
        password: hashedPassword,
        email: "student01@test.com",
        fullName: "Nguyễn Văn An",
        role: "student",
        phone: "0901234567",
        isFirstLogin: false,
        profile: {
          studentCode: "SV001",
          dateOfBirth: new Date("2000-01-15"),
          address: "123 Nguyễn Huệ, Q.1, TP.HCM",
          gender: "male",
        },
      });
      console.log("✅ Student user created:", studentUser.username);
    } else {
      console.log("✅ Student user already exists:", studentUser.username);
    }

    // 2. Create courses
    console.log("📚 Creating courses...");
    const courses = [];
    const courseData = [
      {
        name: "English Basic A1",
        description: "Khóa học tiếng Anh cơ bản dành cho người mới bắt đầu",
        level: "beginner",
        duration: {
          hours: 80,
          weeks: 10,
        },
        fee: {
          amount: 5000000,
          currency: "VND",
        },
        capacity: {
          max: 20,
        },
        status: "active",
      },
      {
        name: "English Intermediate B1",
        description: "Khóa học tiếng Anh trung cấp",
        level: "intermediate",
        duration: {
          hours: 100,
          weeks: 12,
        },
        fee: {
          amount: 7000000,
          currency: "VND",
        },
        capacity: {
          max: 20,
        },
        status: "active",
      },
      {
        name: "IELTS 6.5 Target",
        description: "Khóa học luyện thi IELTS đạt 6.5",
        level: "intermediate",
        duration: {
          hours: 120,
          weeks: 15,
        },
        fee: {
          amount: 10000000,
          currency: "VND",
        },
        capacity: {
          max: 15,
        },
        status: "active",
      },
    ];

    for (const data of courseData) {
      const course = await Course.create(data);
      courses.push(course);
    }
    console.log(`✅ Created ${courses.length} courses`);

    // 3. Find or create a teacher
    console.log("👨‍🏫 Finding/Creating teacher...");
    let teacher = await User.findOne({ role: "teacher" });
    if (!teacher) {
      teacher = await User.create({
        username: "teacher01",
        password: hashedPassword,
        email: "teacher01@test.com",
        fullName: "Trần Thị Mai",
        role: "teacher",
        phone: "0907654321",
        profile: {
          teacherCode: "GV001",
          specialization: "English",
        },
      });
    }
    console.log("✅ Teacher:", teacher.fullName);

    // 4. Create classes
    console.log("🏫 Creating classes...");
    const classes = await Class.insertMany([
      {
        name: "English Basic A1 - Morning Class",
        course: courses[0]._id,
        teacher: teacher._id,
        students: [
          {
            student: studentUser._id,
            enrolledDate: new Date("2024-10-25"),
            status: "active",
          },
        ],
        capacity: 20,
        room: "Room 101",
        schedule: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: "08:00",
            endTime: "10:00",
          },
          {
            dayOfWeek: 4, // Thursday
            startTime: "08:00",
            endTime: "10:00",
          },
          {
            dayOfWeek: 6, // Saturday
            startTime: "08:00",
            endTime: "10:00",
          },
        ],
        startDate: new Date("2024-11-01"),
        endDate: new Date("2025-02-01"),
        status: "ongoing",
      },
      {
        name: "IELTS 6.5 - Evening Class",
        course: courses[2]._id,
        teacher: teacher._id,
        students: [
          {
            student: studentUser._id,
            enrolledDate: new Date("2024-10-10"),
            status: "completed",
          },
        ],
        capacity: 15,
        room: "Room 201",
        schedule: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: "18:00",
            endTime: "20:30",
          },
          {
            dayOfWeek: 4, // Thursday
            startTime: "18:00",
            endTime: "20:30",
          },
          {
            dayOfWeek: 6, // Saturday
            startTime: "18:00",
            endTime: "20:30",
          },
        ],
        startDate: new Date("2024-10-15"),
        endDate: new Date("2025-04-15"),
        status: "completed",
      },
    ]);
    console.log(`✅ Created ${classes.length} classes`);

    // 5. Create attendance records
    console.log("✅ Creating attendance records...");
    const attendanceRecords = [];
    const today = new Date();

    // Attendance for Class 1 (last 10 sessions)
    for (let i = 0; i < 10; i++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - i * 2); // Every 2 days

      attendanceRecords.push({
        student: studentUser._id,
        class: classes[0]._id,
        course: courses[0]._id,
        date: sessionDate,
        status: i % 5 === 0 ? "absent" : "present", // Absent every 5th session
        note: i % 5 === 0 ? "Nghỉ có phép" : "",
      });
    }

    // Attendance for Class 2 (completed - 30 sessions)
    for (let i = 0; i < 30; i++) {
      const sessionDate = new Date("2024-10-15");
      sessionDate.setDate(sessionDate.getDate() + i * 2);

      attendanceRecords.push({
        student: studentUser._id,
        class: classes[1]._id,
        course: courses[2]._id,
        date: sessionDate,
        status: i % 8 === 0 ? "absent" : "present",
      });
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} attendance records`);

    // 7. Create grades
    console.log("🏆 Creating grades...");
    const grades = await Grade.insertMany([
      {
        student: studentUser._id,
        class: classes[0]._id,
        course: courses[0]._id,
        midtermGrade: 7.5,
        finalGrade: 8.0,
        assignments: [
          { name: "Assignment 1", grade: 8.5, weight: 10 },
          { name: "Assignment 2", grade: 7.0, weight: 10 },
        ],
        remarks: "Good progress",
      },
      {
        student: studentUser._id,
        class: classes[1]._id,
        course: courses[2]._id,
        midtermGrade: 6.5,
        finalGrade: 7.0,
        assignments: [
          { name: "IELTS Reading Practice", grade: 7.0, weight: 15 },
          { name: "IELTS Writing Practice", grade: 6.5, weight: 15 },
          { name: "IELTS Listening Practice", grade: 7.5, weight: 15 },
        ],
        remarks: "Passed with good results",
      },
    ]);
    console.log(`✅ Created ${grades.length} grade records`);

    // 8. Create schedules
    console.log("📅 Creating schedules...");
    const schedules = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14); // Start 2 weeks ago

    for (let i = 0; i < 20; i++) {
      const scheduleDate = new Date(startDate);
      scheduleDate.setDate(startDate.getDate() + i * 2); // Every 2 days

      const dayOfWeek = scheduleDate.getDay();
      if ([1, 3, 5].includes(dayOfWeek)) {
        // Mon, Wed, Fri
        schedules.push({
          class: classes[0]._id,
          course: courses[0]._id,
          teacher: teacher._id,
          date: scheduleDate,
          startTime: "08:00",
          endTime: "10:00",
          room: "Room 101",
          status: i < 10 ? "completed" : "scheduled",
        });
      }
    }

    await Schedule.insertMany(schedules);
    console.log(`✅ Created ${schedules.length} schedules`);

    // 8. Create payment records
    console.log("💰 Creating payment records...");
    const payments = await Payment.insertMany([
      {
        student: studentUser._id,
        course: courses[0]._id,
        type: "tuition",
        amount: 5000000,
        paymentMethod: "bank_transfer",
        status: "paid",
        paidAmount: 5000000,
        paidDate: new Date("2024-10-25"),
        dueDate: new Date("2024-11-01"),
        description: "Học phí khóa English Basic A1",
        createdBy: studentUser._id,
      },
      {
        student: studentUser._id,
        course: courses[2]._id,
        type: "tuition",
        amount: 10000000,
        paymentMethod: "cash",
        status: "paid",
        paidAmount: 10000000,
        paidDate: new Date("2024-10-10"),
        dueDate: new Date("2024-10-15"),
        description: "Học phí khóa IELTS 6.5",
        createdBy: studentUser._id,
      },
      {
        student: studentUser._id,
        course: courses[0]._id,
        type: "tuition",
        amount: 2000000,
        paymentMethod: "other",
        status: "pending",
        paidAmount: 0,
        dueDate: new Date("2025-01-01"),
        description: "Học phí kỳ 2 - English Basic A1",
        createdBy: studentUser._id,
      },
    ]);
    console.log(`✅ Created ${payments.length} payment records`);

    // 10. Create notifications
    console.log("🔔 Creating notifications...");
    const notifications = await Notification.insertMany([
      {
        recipient: studentUser._id,
        title: "Chào mừng bạn đến với hệ thống",
        message: "Chúc bạn học tập tốt và đạt kết quả cao!",
        type: "announcement",
        isRead: true,
        createdAt: new Date("2024-10-20"),
      },
      {
        recipient: studentUser._id,
        title: "Lịch học tuần này",
        message: "Bạn có 3 buổi học vào thứ 2, 4, 6 lúc 8:00 AM",
        type: "class_schedule",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: studentUser._id,
        title: "Nhắc nhở thanh toán học phí",
        message: "Học phí kỳ 2 sẽ đến hạn vào ngày 01/01/2025",
        type: "payment_reminder",
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: studentUser._id,
        title: "Điểm giữa kỳ đã cập nhật",
        message: "Điểm giữa kỳ môn English Basic A1: 7.5 điểm",
        type: "grade_published",
        isRead: false,
        createdAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${notifications.length} notifications`);

    console.log("\n🎉 Student data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Student user: ${studentUser.username} / 123456`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Classes: ${classes.length}`);
    console.log(`- Attendance records: ${attendanceRecords.length}`);
    console.log(`- Grades: ${grades.length}`);
    console.log(`- Schedules: ${schedules.length}`);
    console.log(`- Payments: ${payments.length}`);
    console.log(`- Notifications: ${notifications.length}`);
    console.log("\n✅ You can now login with:");
    console.log("   Username: student01");
    console.log("   Password: 123456");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  }
}

// Run the seeder
seedStudentData();
