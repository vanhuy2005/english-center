require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/database");

// Import models
const User = require("./src/shared/models/User.model");
const Student = require("./src/shared/models/Student.model");
const Teacher = require("./src/shared/models/Teacher.model");
const Course = require("./src/shared/models/Course.model");
const Class = require("./src/shared/models/Class.model");
const Schedule = require("./src/shared/models/Schedule.model");
const Grade = require("./src/shared/models/Grade.model");
const Attendance = require("./src/shared/models/Attendance.model");
const Finance = require("./src/shared/models/Finance.model");
const Notification = require("./src/shared/models/Notification.model");
const Request = require("./src/shared/models/Request.model");

/**
 * Complete Seed Data Script
 * Tạo dữ liệu mẫu đầy đủ cho tất cả modules
 */

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("\n🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Course.deleteMany({});
    await Class.deleteMany({});
    await Schedule.deleteMany({});
    await Grade.deleteMany({});
    await Attendance.deleteMany({});
    await Finance.deleteMany({});
    await Notification.deleteMany({});
    await Request.deleteMany({});
    console.log("✅ Cleared all collections");

    // ==================== CREATE USERS ====================
    console.log("\n👥 Creating users...");

    const hashedPassword = await bcrypt.hash("123456", 10);

    // Director
    const directorUser = await User.create({
      fullName: "Giám Đốc Trung Tâm",
      email: "director@englishcenter.com",
      phone: "0901000001",
      password: hashedPassword,
      role: "director",
      status: "active",
      isFirstLogin: false,
    });

    // Accountant
    const accountantUser = await User.create({
      fullName: "Nhân Viên Kế Toán",
      email: "accountant@englishcenter.com",
      phone: "0901000002",
      password: hashedPassword,
      role: "accountant",
      status: "active",
      isFirstLogin: false,
    });

    // Academic Staff
    const academicUser = await User.create({
      fullName: "Nhân Viên Học Vụ",
      email: "academic@englishcenter.com",
      phone: "0901000003",
      password: hashedPassword,
      role: "academic",
      status: "active",
      isFirstLogin: false,
    });

    // Enrollment Staff
    const enrollmentUser = await User.create({
      fullName: "Nhân Viên Tuyển Sinh",
      email: "enrollment@englishcenter.com",
      phone: "0901000004",
      password: hashedPassword,
      role: "enrollment",
      status: "active",
      isFirstLogin: false,
    });

    console.log("✅ Created staff users");

    // ==================== CREATE TEACHERS ====================
    console.log("\n👨‍🏫 Creating teachers...");

    const teacher1User = await User.create({
      fullName: "Nguyễn Văn Giáo",
      email: "teacher1@englishcenter.com",
      phone: "0902000001",
      password: hashedPassword,
      role: "teacher",
      status: "active",
      isFirstLogin: false,
    });

    const teacher1 = await Teacher.create({
      user: teacher1User._id,
      fullName: "Nguyễn Văn Giáo",
      email: teacher1User.email,
      phone: teacher1User.phone,
      dateOfBirth: new Date("1985-05-15"),
      gender: "male",
      address: "123 Lê Lợi, Quận 1, TP.HCM",
      qualification: "TESOL Certificate, MA in English",
      experience: 8,
      specialization: ["IELTS", "TOEIC", "Business English"],
      teachingLevel: ["beginner", "intermediate", "advanced"],
      status: "active",
      salary: 15000000,
      joinDate: new Date("2020-01-15"),
    });
    const teacher2User = await User.create({
      fullName: "Trần Thị Hương",
      email: "teacher2@englishcenter.com",
      phone: "0902000002",
      password: hashedPassword,
      role: "teacher",
      status: "active",
      isFirstLogin: false,
    });

    const teacher2 = await Teacher.create({
      user: teacher2User._id,
      fullName: "Trần Thị Hương",
      email: teacher2User.email,
      phone: teacher2User.phone,
      dateOfBirth: new Date("1990-08-20"),
      gender: "female",
      address: "456 Nguyễn Huệ, Quận 1, TP.HCM",
      qualification: "CELTA, BA in English",
      experience: 5,
      specialization: ["General English", "Kids English"],
      teachingLevel: ["beginner", "intermediate"],
      status: "active",
      salary: 12000000,
      joinDate: new Date("2021-06-01"),
    });

    console.log("✅ Created 2 teachers");

    // ==================== CREATE COURSES ====================
    console.log("\n📚 Creating courses...");

    const courseBasic = await Course.create({
      name: "English Basic A1",
      courseCode: "ENG-A1",
      description: "Khóa học tiếng Anh cơ bản dành cho người mới bắt đầu",
      level: "beginner",
      duration: {
        hours: 48,
        weeks: 12,
      },
      schedule: {
        daysPerWeek: 3,
        hoursPerDay: 2,
      },
      fee: {
        amount: 3000000,
        currency: "VND",
      },
      capacity: {
        min: 5,
        max: 15,
      },
      status: "active",
    });

    const courseIELTS = await Course.create({
      name: "IELTS 6.5",
      courseCode: "IELTS-65",
      description: "Khóa học IELTS mục tiêu 6.5",
      level: "intermediate",
      duration: {
        hours: 90,
        weeks: 16,
      },
      schedule: {
        daysPerWeek: 3,
        hoursPerDay: 2.5,
      },
      fee: {
        amount: 8000000,
        currency: "VND",
      },
      capacity: {
        min: 5,
        max: 12,
      },
      status: "active",
    });

    console.log("✅ Created 2 courses");

    // ==================== CREATE STUDENTS ====================
    console.log("\n👨‍🎓 Creating students...");

    const students = [];
    for (let i = 1; i <= 10; i++) {
      const studentUser = await User.create({
        fullName: `Học Viên ${i}`,
        email: `student${i}@example.com`,
        phone: `090300000${i}`,
        password: hashedPassword,
        role: "student",
        status: "active",
        isFirstLogin: i > 5, // First 5 already changed password
      });

      const student = await Student.create({
        user: studentUser._id,
        fullName: `Học Viên ${i}`,
        email: studentUser.email,
        phone: studentUser.phone,
        dateOfBirth: new Date(`200${i % 5}-0${(i % 12) + 1}-15`),
        gender: i % 2 === 0 ? "female" : "male",
        address: `${i}23 Đường ABC, Quận ${(i % 5) + 1}, TP.HCM`,
        guardianName: `Phụ Huynh ${i}`,
        guardianPhone: `090400000${i}`,
        level: i <= 5 ? "beginner" : "intermediate",
        status: "active",
        enrollmentDate: new Date("2024-09-01"),
      });

      students.push(student);
    }

    console.log(`✅ Created ${students.length} students`);

    // ==================== CREATE CLASSES ====================
    console.log("\n🏫 Creating classes...");

    const class1 = await Class.create({
      name: "English Basic A1 - Morning Class",
      code: "EB-A1-M01",
      course: courseBasic._id,
      teacher: teacher2._id,
      schedule: {
        dayOfWeek: [2, 4, 6], // Mon, Wed, Fri
        startTime: "08:00",
        endTime: "10:00",
      },
      startDate: new Date("2024-10-01"),
      endDate: new Date("2024-12-31"),
      maxStudents: 15,
      currentStudents: 0,
      room: "A101",
      status: "active",
      tuitionFee: 3000000,
    });

    const class2 = await Class.create({
      name: "IELTS 6.5 - Evening Class",
      code: "IELTS-65-E01",
      course: courseIELTS._id,
      teacher: teacher1._id,
      schedule: {
        dayOfWeek: [3, 5, 7], // Tue, Thu, Sat
        startTime: "18:00",
        endTime: "20:30",
      },
      startDate: new Date("2024-10-15"),
      endDate: new Date("2025-01-31"),
      maxStudents: 12,
      currentStudents: 0,
      room: "B201",
      status: "active",
      tuitionFee: 8000000,
    });

    // Enroll students to classes
    class1.students = students.slice(0, 5).map((s) => s._id);
    class1.currentStudents = 5;
    await class1.save();

    class2.students = students.slice(5, 10).map((s) => s._id);
    class2.currentStudents = 5;
    await class2.save();

    console.log("✅ Created 2 classes and enrolled students");

    // ==================== CREATE SCHEDULES ====================
    console.log("\n📅 Creating schedules...");

    const now = new Date();
    const schedules = [];

    // Create 10 sessions for each class
    for (let i = 0; i < 10; i++) {
      const sessionDate1 = new Date(now);
      sessionDate1.setDate(now.getDate() - (30 - i * 3)); // Past sessions

      schedules.push(
        await Schedule.create({
          class: class1._id,
          teacher: teacher2._id,
          date: sessionDate1,
          startTime: "08:00",
          endTime: "10:00",
          room: "A101",
          status: "completed",
          topic: `Session ${i + 1}: Basic Grammar`,
        })
      );

      const sessionDate2 = new Date(now);
      sessionDate2.setDate(now.getDate() - (28 - i * 3));

      schedules.push(
        await Schedule.create({
          class: class2._id,
          teacher: teacher1._id,
          date: sessionDate2,
          startTime: "18:00",
          endTime: "20:30",
          room: "B201",
          status: "completed",
          topic: `Session ${i + 1}: IELTS Reading`,
        })
      );
    }

    console.log(`✅ Created ${schedules.length} schedule sessions`);

    // ==================== CREATE ATTENDANCE ====================
    console.log("\n✅ Creating attendance records...");

    let attendanceCount = 0;
    for (const schedule of schedules.slice(0, 10)) {
      // Only for class1 sessions
      const classStudents = class1.students;

      for (const studentId of classStudents) {
        const isPresent = Math.random() > 0.2; // 80% attendance rate
        await Attendance.create({
          student: studentId,
          class: class1._id,
          schedule: schedule._id,
          date: schedule.date,
          status: isPresent ? "present" : "absent",
          note: isPresent ? "" : "Không có lý do",
        });
        attendanceCount++;
      }
    }

    console.log(`✅ Created ${attendanceCount} attendance records`);

    // ==================== CREATE GRADES ====================
    console.log("\n📊 Creating grades...");

    let gradeCount = 0;
    for (const student of students.slice(0, 5)) {
      // For class1 students
      await Grade.create({
        student: student._id,
        class: class1._id,
        course: courseBasic._id,
        midtermScore: Math.floor(Math.random() * 3 + 7), // 7-10
        finalScore: Math.floor(Math.random() * 3 + 7),
        attendanceScore: Math.floor(Math.random() * 2 + 8), // 8-10
        assignmentScore: Math.floor(Math.random() * 3 + 7),
        overallScore: Math.floor(Math.random() * 3 + 7.5),
        letterGrade: ["A", "B+", "B"][Math.floor(Math.random() * 3)],
        comment: "Good progress",
        createdBy: teacher2._id,
      });
      gradeCount++;
    }

    console.log(`✅ Created ${gradeCount} grade records`);

    // ==================== CREATE FINANCE RECORDS ====================
    console.log("\n💰 Creating finance records...");

    let financeCount = 0;
    // Tuition fees for all students
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const classRef = i < 5 ? class1 : class2;
      const amount = i < 5 ? 3000000 : 8000000;

      // Paid students (60%)
      if (i % 5 !== 0) {
        await Finance.create({
          student: student._id,
          course: classRef.course,
          class: classRef._id,
          type: "tuition",
          amount: amount,
          paidAmount: amount,
          status: "paid",
          paymentMethod: ["bank_transfer", "cash", "card"][
            Math.floor(Math.random() * 3)
          ],
          transactionCode: `TXN${Date.now()}${i}`,
          description: `Học phí khóa ${classRef.code}`,
          dueDate: new Date("2024-10-15"),
          paidDate: new Date("2024-10-10"),
        });
      } else {
        // Pending students
        await Finance.create({
          student: student._id,
          course: classRef.course,
          class: classRef._id,
          type: "tuition",
          amount: amount,
          paidAmount: 0,
          status: "pending",
          description: `Học phí khóa ${classRef.code}`,
          dueDate: new Date("2024-11-30"),
        });
      }
      financeCount++;
    }

    console.log(`✅ Created ${financeCount} finance records`);

    // ==================== CREATE NOTIFICATIONS ====================
    console.log("\n🔔 Creating notifications...");

    const notifications = [];

    // For each student
    for (const student of students) {
      notifications.push(
        await Notification.create({
          recipient: student.user,
          type: "announcement",
          title: "Chào mừng đến với trung tâm",
          message: "Chúc bạn học tập tốt!",
          priority: "normal",
          status: "sent",
        })
      );
    }

    // For teachers
    for (const teacher of [teacher1, teacher2]) {
      notifications.push(
        await Notification.create({
          recipient: teacher.user,
          type: "announcement",
          title: "Lịch giảng dạy tháng 11",
          message: "Vui lòng kiểm tra lịch giảng dạy",
          priority: "high",
          status: "sent",
        })
      );
    }

    console.log(`✅ Created ${notifications.length} notifications`);

    // ==================== CREATE REQUESTS ====================
    console.log("\n📝 Creating requests...");

    const requests = [];

    // Some leave requests
    for (let i = 0; i < 3; i++) {
      const student = students[i];
      requests.push(
        await Request.create({
          student: student._id,
          type: "leave",
          class: class1._id,
          date: new Date(Date.now() + i * 86400000), // Next few days
          reason: `Lý do xin nghỉ học ${i + 1}`,
          status: ["pending", "approved", "rejected"][i],
          processedBy: i > 0 ? academicUser._id : null,
          processedAt: i > 0 ? new Date() : null,
        })
      );
    }

    console.log(`✅ Created ${requests.length} requests`);

    // ==================== SUMMARY ====================
    console.log("\n" + "=".repeat(60));
    console.log("✅ SEED DATA COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`
📊 Summary:
- Users: ${await User.countDocuments()}
  - Director: 1
  - Accountant: 1  
  - Academic: 1
  - Enrollment: 1
  - Teachers: 2
  - Students: 10
  
- Teachers: ${await Teacher.countDocuments()}
- Students: ${await Student.countDocuments()}
- Courses: ${await Course.countDocuments()}
- Classes: ${await Class.countDocuments()}
- Schedules: ${await Schedule.countDocuments()}
- Attendance: ${await Attendance.countDocuments()}
- Grades: ${await Grade.countDocuments()}
- Finance: ${await Finance.countDocuments()}
- Notifications: ${await Notification.countDocuments()}
- Requests: ${await Request.countDocuments()}

🔐 Login Credentials (All passwords: 123456):
- Director: director@englishcenter.com
- Accountant: accountant@englishcenter.com
- Academic: academic@englishcenter.com
- Enrollment: enrollment@englishcenter.com
- Teacher 1: teacher1@englishcenter.com
- Teacher 2: teacher2@englishcenter.com
- Student 1-10: student1@example.com ... student10@example.com
`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
