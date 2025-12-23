/**
 * Seed script for Enrollment Staff account with full test data
 * Creates: Enrollment Staff, Students, Classes with enrollments, Requests
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const Staff = require("../src/shared/models/Staff.model");
const Student = require("../src/shared/models/Student.model");
const Course = require("../src/shared/models/Course.model");
const Class = require("../src/shared/models/Class.model");
const Request = require("../src/shared/models/Request.model");
const Notification = require("../src/shared/models/Notification.model");

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/english-center-db"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

async function seedEnrollmentStaff() {
  try {
    // ============================
    // BƯỚC 1: Tạo/Cập nhật Enrollment Staff
    // ============================
    console.log("\n👤 Creating/updating Enrollment Staff account...");

    const hashedPassword = await bcrypt.hash("123456", 10);

    let enrollmentStaff = await Staff.findOne({ phone: "0903000001" });

    if (!enrollmentStaff) {
      enrollmentStaff = new Staff({
        staffCode: "NV-ENR001",
        fullName: "Nguyễn Thị Tuyển Sinh",
        phone: "0903000001",
        password: hashedPassword,
        staffType: "enrollment",
        status: "active",
        dateOfBirth: new Date("1992-05-15"),
        address: "789 Đường Nguyễn Huệ, Quận 1, TP.HCM",
        gender: "female",
        employmentStatus: "active",
      });
      await enrollmentStaff.save();
      console.log(
        "✅ Created new Enrollment Staff:",
        enrollmentStaff.staffCode
      );
    } else {
      console.log("ℹ️  Staff account already exists — updating...");
      enrollmentStaff.password = hashedPassword;
      enrollmentStaff.fullName = "Nguyễn Thị Tuyển Sinh";
      await enrollmentStaff.save();
      console.log("✅ Updated Enrollment Staff:", enrollmentStaff.staffCode);
    }

    // ============================
    // BƯỚC 2: Tạo 15 Students với đa dạng trạng thái
    // ============================
    console.log("\n📚 Creating students...");

    const studentData = [
      {
        name: "Trần Văn An",
        email: "student_an@test.com",
        phone: "0901111001",
        status: "active",
      },
      {
        name: "Lê Thị Bình",
        email: "student_binh@test.com",
        phone: "0901111002",
        status: "active",
      },
      {
        name: "Phạm Văn Cường",
        email: "student_cuong@test.com",
        phone: "0901111003",
        status: "active",
      },
      {
        name: "Nguyễn Thị Dung",
        email: "student_dung@test.com",
        phone: "0901111004",
        status: "active",
      },
      {
        name: "Hoàng Văn Em",
        email: "student_em@test.com",
        phone: "0901111005",
        status: "paused",
      },
      {
        name: "Võ Thị Phượng",
        email: "student_phuong@test.com",
        phone: "0901111006",
        status: "active",
      },
      {
        name: "Đặng Văn Giang",
        email: "student_giang@test.com",
        phone: "0901111007",
        status: "active",
      },
      {
        name: "Bùi Thị Hà",
        email: "student_ha@test.com",
        phone: "0901111008",
        status: "inactive",
      },
      {
        name: "Trương Văn Ích",
        email: "student_ich@test.com",
        phone: "0901111009",
        status: "active",
      },
      {
        name: "Lý Thị Kiều",
        email: "student_kieu@test.com",
        phone: "0901111010",
        status: "active",
      },
      {
        name: "Mai Văn Long",
        email: "student_long@test.com",
        phone: "0901111011",
        status: "active",
      },
      {
        name: "Phan Thị Mai",
        email: "student_mai@test.com",
        phone: "0901111012",
        status: "paused",
      },
      {
        name: "Đinh Văn Nam",
        email: "student_nam@test.com",
        phone: "0901111013",
        status: "active",
      },
      {
        name: "Chu Thị Oanh",
        email: "student_oanh@test.com",
        phone: "0901111014",
        status: "active",
      },
      {
        name: "Dương Văn Phúc",
        email: "student_phuc@test.com",
        phone: "0901111015",
        status: "active",
      },
    ];

    const students = [];
    const hashedStudentPw = await bcrypt.hash("Student123!", 10);

    for (let i = 0; i < studentData.length; i++) {
      const data = studentData[i];
      let student = await Student.findOne({ email: data.email });

      if (!student) {
        student = new Student({
          studentCode: `HV${String(2000 + i).padStart(5, "0")}`,
          fullName: data.name,
          email: data.email,
          password: hashedStudentPw,
          phone: data.phone,
          dateOfBirth: new Date(1998 + Math.floor(i / 3), (i % 12) + 1, 15),
          address: `${100 + i} Đường ABC, Quận ${(i % 10) + 1}, TP.HCM`,
          status: data.status,
        });
        await student.save();
      }
      students.push(student);
    }
    console.log(`✅ Created/found ${students.length} students`);

    // ============================
    // BƯỚC 3: Lấy Courses và Teacher
    // ============================
    console.log("\n📖 Finding courses and teacher...");

    const courses = await Course.find({ status: "active" }).limit(3);
    if (courses.length === 0) {
      console.error("❌ No courses found. Please run seedCourses.js first");
      process.exit(1);
    }

    const teacher = await Staff.findOne({ role: "teacher" });
    if (!teacher) {
      console.error("❌ No teacher found. Please create a teacher first");
      process.exit(1);
    }

    // ============================
    // BƯỚC 4: Tạo Classes với students enrolled
    // ============================
    console.log("\n🏫 Creating classes with enrollments...");

    const classes = [];

    for (let i = 0; i < 3; i++) {
      const course = courses[i];

      // Delete existing class if any
      await Class.deleteOne({
        course: course._id,
        name: `${course.name} - Lớp ENR ${i + 1}`,
      });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30 + i * 10);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);

      const classDoc = new Class({
        classCode: `ENR-CLASS-${String(i + 1).padStart(3, "0")}`,
        name: `${course.name} - Lớp ENR ${i + 1}`,
        course: course._id,
        teacher: teacher._id,
        startDate,
        endDate,
        schedule: [
          { dayOfWeek: 1, startTime: "18:00", endTime: "20:00" }, // Monday
          { dayOfWeek: 3, startTime: "18:00", endTime: "20:00" }, // Wednesday
          { dayOfWeek: 5, startTime: "18:00", endTime: "20:00" }, // Friday
        ],
        room: `P${201 + i}`,
        capacity: { max: 25, current: 0 },
        status: "active",
      });

      // Enroll 5 students per class
      const classStudents = students.slice(i * 5, i * 5 + 5);
      for (const student of classStudents) {
        classDoc.students.push({
          student: student._id,
          enrolledDate: new Date(
            startDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
          ),
          status: student.status === "active" ? "active" : "dropped",
        });
      }

      classDoc.capacity.current = classStudents.length;
      await classDoc.save();
      classes.push(classDoc);

      console.log(
        `✅ Created class: ${classDoc.name} with ${classStudents.length} students`
      );
    }

    // ============================
    // BƯỚC 5: Tạo Requests đa dạng
    // ============================
    console.log("\n📝 Creating requests...");

    // Delete old requests
    await Request.deleteMany({
      student: { $in: students.map((s) => s._id) },
    });

    const requestData = [
      {
        student: students[0],
        type: "transfer",
        class: classes[0]._id,
        reason:
          "Muốn chuyển sang lớp có lịch học phù hợp hơn với công việc hiện tại",
        status: "pending",
        priority: "normal",
      },
      {
        student: students[1],
        type: "leave",
        class: classes[0]._id,
        reason: "Cần xin nghỉ 2 buổi học do công tác xa",
        status: "pending",
        priority: "high",
      },
      {
        student: students[2],
        type: "pause",
        class: classes[1]._id,
        reason:
          "Xin bảo lưu khóa học vì lý do sức khỏe, dự kiến quay lại sau 2 tháng",
        status: "pending",
        priority: "normal",
      },
      {
        student: students[5],
        type: "transfer",
        class: classes[1]._id,
        reason: "Muốn chuyển sang lớp buổi sáng",
        status: "approved",
        priority: "normal",
        processedBy: enrollmentStaff._id,
        processedAt: new Date(),
        processingNote: "Đã chuyển sang lớp sáng thứ 3-5-7",
      },
      {
        student: students[7],
        type: "withdrawal",
        class: classes[2]._id,
        reason: "Xin rút khỏi khóa học vì chuyển công tác ra nước ngoài",
        status: "rejected",
        priority: "high",
        processedBy: enrollmentStaff._id,
        processedAt: new Date(),
        processingNote: "Từ chối vì chưa hoàn thành 50% khóa học",
      },
    ];

    for (const data of requestData) {
      const request = new Request({
        requestCode: `REQ-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        student: data.student._id,
        type: data.type,
        class: data.class,
        reason: data.reason,
        status: data.status,
        priority: data.priority,
        processedBy: data.processedBy,
        processedAt: data.processedAt,
        processingNote: data.processingNote,
      });
      await request.save();
    }

    console.log(`✅ Created ${requestData.length} requests`);

    // ============================
    // BƯỚC 6: Tạo Notifications cho enrollment staff
    // ============================
    console.log("\n🔔 Creating notifications...");

    await Notification.deleteMany({
      recipient: enrollmentStaff._id,
    });

    const notifications = [
      {
        type: "request_response",
        title: "Yêu cầu mới: Chuyển lớp",
        message: `${students[0].fullName} yêu cầu chuyển lớp`,
        recipient: enrollmentStaff._id,
        recipientModel: "Staff",
        priority: "normal",
        isRead: false,
      },
      {
        type: "request_response",
        title: "Yêu cầu mới: Xin nghỉ học",
        message: `${students[1].fullName} yêu cầu nghỉ học`,
        recipient: enrollmentStaff._id,
        recipientModel: "Staff",
        priority: "high",
        isRead: false,
      },
      {
        type: "system",
        title: "Học viên mới đăng ký",
        message: `${students[10].fullName} vừa hoàn tất đăng ký khóa học`,
        recipient: enrollmentStaff._id,
        recipientModel: "Staff",
        priority: "normal",
        isRead: true,
      },
    ];

    for (const data of notifications) {
      const notification = new Notification(data);
      await notification.save();
    }

    console.log(`✅ Created ${notifications.length} notifications`);

    // ============================
    // SUMMARY
    // ============================
    console.log("\n==================================================");
    console.log("🎉 SEED COMPLETED FOR ENROLLMENT STAFF");
    console.log("==================================================\n");
    console.log("� SĐT: 0903000001");
    console.log("🔑 Mật khẩu: 123456");
    console.log("👤 Họ tên: Nguyễn Thị Tuyển Sinh\n");
    console.log(`📚 Students created: ${students.length}`);
    console.log(`🏫 Classes created: ${classes.length}`);
    console.log(`📝 Requests created: ${requestData.length}`);
    console.log(`🔔 Notifications created: ${notifications.length}\n`);
    console.log("Dashboard Stats:");
    console.log(
      `  - Active Students: ${
        students.filter((s) => s.status === "active").length
      }`
    );
    console.log(
      `  - Paused Students: ${
        students.filter((s) => s.status === "paused").length
      }`
    );
    console.log(
      `  - Pending Requests: ${
        requestData.filter((r) => r.status === "pending").length
      }`
    );
    console.log(
      `  - Active Classes: ${
        classes.filter((c) => c.status === "active").length
      }`
    );
    console.log("==================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seedEnrollmentStaff();
