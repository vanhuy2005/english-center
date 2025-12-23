#!/usr/bin/env node
require("dotenv").config();

const connectDB = require("../src/config/database");
const Student = require("../src/shared/models/Student.model");
const Course = require("../src/shared/models/Course.model");
const Class = require("../src/shared/models/Class.model");
const Staff = require("../src/shared/models/Staff.model");
const Grade = require("../src/shared/models/Grade.model");
const Attendance = require("../src/shared/models/Attendance.model");
const TuitionFee = require("../src/shared/models/TuitionFee.model");
const Payment = require("../src/shared/models/Payment.model");
const Notification = require("../src/shared/models/Notification.model");
const Schedule = require("../src/shared/models/Schedule.model");
const Request = require("../src/shared/models/Request.model");

const STUDENT_DATA = {
  email: "student1@test.com",
  password: "Student123!",
  fullName: "Nguyễn Văn Student 1",
  phone: "0902000001",
  dateOfBirth: new Date("2001-03-20"),
  gender: "male",
  address: "456 Đường Lê Lợi, Quận Tân Bình, TP.HCM",
  contactInfo: {
    phone: "0902000001",
    email: "student1@test.com",
  },
  contactPerson: {
    name: "Nguyễn Văn Cha",
    relation: "Cha",
    phone: "0903000001",
    email: "parent1@example.com",
  },
  academicStatus: "active",
  notes: "Học viên Student 1 với đầy đủ thông tin",
};

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // ============================
    // BƯỚC 1: Tạo/Cập nhật Student
    // ============================
    let student = await Student.findOne({ email: STUDENT_DATA.email });

    if (student) {
      console.log("ℹ️  Student account already exists — updating...");
      Object.assign(student, STUDENT_DATA);
      await student.save();
      console.log("✅ Student account updated:", student.studentCode);
    } else {
      console.log("ℹ️  Creating new student account...");
      student = new Student(STUDENT_DATA);
      await student.save();
      console.log("✅ Student account created:", student.studentCode);
    }

    // ============================
    // BƯỚC 2: Tìm Courses và Teacher
    // ============================
    const courses = await Course.find().limit(3);
    if (courses.length === 0) {
      console.log("⚠️  No courses found. Please run seedCourses.js first.");
      process.exit(1);
    }

    const teacher = await Staff.findOne({ staffType: "teacher" });
    if (!teacher) {
      console.log("ℹ️  No teacher found. Creating sample teacher...");
      const newTeacher = new Staff({
        email: "teacher.sample@example.com",
        password: "Teacher123!",
        fullName: "Trần Thị Lan",
        phone: "0914000001",
        staffType: "teacher",
        staffCode: "GV001",
        department: "Giảng dạy",
        position: "Giáo viên",
        status: "active",
      });
      await newTeacher.save();
      console.log("✅ Sample teacher created:", newTeacher.staffCode);
    }

    const teacherStaff =
      teacher || (await Staff.findOne({ staffType: "teacher" }));

    // ============================
    // BƯỚC 3: Tạo Classes (nếu chưa có)
    // ============================
    const classes = [];
    for (let i = 0; i < Math.min(courses.length, 3); i++) {
      const course = courses[i];
      let classDoc = await Class.findOne({ course: course._id });

      if (!classDoc) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 60 + i * 30);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 90);

        classDoc = new Class({
          name: `${course.courseName} - Lớp ${String.fromCharCode(65 + i)}`,
          course: course._id,
          teacher: teacherStaff._id,
          startDate,
          endDate,
          schedule: [
            {
              dayOfWeek: 1, // Monday
              startTime: "18:00",
              endTime: "20:00",
            },
            {
              dayOfWeek: 3, // Wednesday
              startTime: "18:00",
              endTime: "20:00",
            },
            {
              dayOfWeek: 5, // Friday
              startTime: "18:00",
              endTime: "20:00",
            },
          ],
          room: `P${101 + i}`,
          capacity: { max: 25, current: 0 },
          status: "active",
        });
        await classDoc.save();
        console.log(`✅ Class created: ${classDoc.name}`);
      }
      classes.push(classDoc);

      // Đăng ký học viên vào lớp với đúng structure
      const alreadyEnrolled = classDoc.students.some(
        (s) => s.student && s.student.toString() === student._id.toString()
      );
      if (!alreadyEnrolled) {
        classDoc.students.push({
          student: student._id,
          enrolledDate: new Date(),
          status: "active",
        });
        classDoc.capacity.current = classDoc.students.length;
        await classDoc.save();
        console.log(`✅ Enrolled student into ${classDoc.name}`);
      }
    }

    // ============================
    // BƯỚC 4: Tạo Schedules
    // ============================
    console.log("\n📅 Creating schedules...");
    await Schedule.deleteMany({ class: { $in: classes.map((c) => c._id) } });

    for (const classDoc of classes) {
      const schedules = [];
      const startDate = new Date(classDoc.startDate);
      const endDate = new Date(classDoc.endDate);

      // Tạo lịch học cho 4 tuần tới
      for (let week = 0; week < 4; week++) {
        for (const scheduleItem of classDoc.schedule) {
          const scheduleDate = new Date(startDate);
          const daysToAdd = week * 7 + (scheduleItem.dayOfWeek - 1);
          scheduleDate.setDate(startDate.getDate() + daysToAdd);

          if (scheduleDate <= endDate) {
            schedules.push({
              class: classDoc._id,
              course: classDoc.course,
              teacher: classDoc.teacher,
              date: scheduleDate,
              startTime: scheduleItem.startTime,
              endTime: scheduleItem.endTime,
              room: classDoc.room,
              status: "scheduled",
              topic: `Buổi ${
                week * classDoc.schedule.length +
                classDoc.schedule.indexOf(scheduleItem) +
                1
              }`,
            });
          }
        }
      }

      if (schedules.length > 0) {
        await Schedule.insertMany(schedules);
        console.log(
          `✅ Created ${schedules.length} schedules for ${classDoc.name}`
        );
      }
    }

    // ============================
    // BƯỚC 5: Tạo Grades
    // ============================
    console.log("\n📊 Creating grades...");
    await Grade.deleteMany({ student: student._id });

    for (const classDoc of classes) {
      const grade = new Grade({
        student: student._id,
        class: classDoc._id,
        course: classDoc.course,
        scores: {
          midterm: 7.5 + Math.random() * 2,
          final: 8.0 + Math.random() * 2,
          assignments: [8.5, 9.0, 7.5],
        },
        overall: 8.2,
        status: "completed",
      });
      await grade.save();
      console.log(`✅ Grade created for ${classDoc.name}`);
    }

    // ============================
    // BƯỚC 6: Tạo Attendance
    // ============================
    console.log("\n✔️  Creating attendance records...");
    await Attendance.deleteMany({ student: student._id });

    const schedules = await Schedule.find({
      class: { $in: classes.map((c) => c._id) },
    });

    for (const schedule of schedules) {
      const isPast = schedule.date < new Date();
      if (isPast) {
        const attendance = new Attendance({
          student: student._id,
          class: schedule.class,
          course: schedule.course,
          date: schedule.date,
          status: Math.random() > 0.1 ? "present" : "absent",
          notes: Math.random() > 0.8 ? "Học rất tốt" : "",
        });
        await attendance.save();
      }
    }
    console.log(`✅ Created attendance records`);

    // ============================
    // BƯỚC 7: Tạo Tuition Fees & Payments
    // ============================
    console.log("\n💰 Creating tuition fees and payments...");
    await TuitionFee.deleteMany({ student: student._id });
    await Payment.deleteMany({ student: student._id });

    for (let i = 0; i < classes.length; i++) {
      const classDoc = classes[i];
      const course = courses[i];

      const tuitionAmount = course.price || 5000000;
      const tuitionFee = new TuitionFee({
        student: student._id,
        class: classDoc._id,
        amount: tuitionAmount,
        paidAmount: i === 0 ? tuitionAmount : 0,
        remainingAmount: i === 0 ? 0 : tuitionAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: i === 0 ? "paid" : "unpaid",
        note: i === 0 ? "Đã thanh toán đầy đủ" : "Chưa thanh toán",
      });
      await tuitionFee.save();
      console.log(`✅ Tuition fee created for ${classDoc.name}`);

      // Tạo payment nếu đã thanh toán
      if (i === 0) {
        const payment = new Payment({
          student: student._id,
          class: classDoc._id,
          amount: tuitionAmount,
          paymentMethod: "bank_transfer",
          status: "confirmed",
          description: "Thanh toán học phí qua chuyển khoản",
          note: "Đã xác nhận thanh toán",
          createdBy: teacherStaff._id,
          confirmedBy: teacherStaff._id,
          confirmedAt: new Date(),
        });
        await payment.save();
        console.log(`✅ Payment created for ${classDoc.name}`);
      }
    }

    // ============================
    // BƯỚC 8: Tạo Notifications
    // ============================
    console.log("\n🔔 Creating notifications...");
    await Notification.deleteMany({ recipient: student._id });

    const notifications = [
      {
        recipient: student._id,
        title: "Chào mừng đến với hệ thống",
        message:
          "Chào mừng bạn đến với Trung tâm Anh ngữ. Chúc bạn học tập tốt!",
        type: "system",
        priority: "high",
        isRead: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: student._id,
        title: "Nhắc nhở thanh toán học phí",
        message: `Học phí lớp ${
          classes[1]?.name
        } sẽ đến hạn vào ngày ${new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("vi-VN")}`,
        type: "payment_reminder",
        priority: "normal",
        isRead: false,
        relatedId: classes[1]?._id,
        relatedModel: "Class",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: student._id,
        title: "Điểm kiểm tra giữa kỳ",
        message: `Điểm kiểm tra giữa kỳ môn ${courses[0]?.courseName} của bạn là 8.5/10`,
        type: "grade_published",
        priority: "normal",
        isRead: true,
        relatedId: courses[0]?._id,
        relatedModel: "Course",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: student._id,
        title: "Thông báo nghỉ học",
        message: `Lớp ${classes[0]?.name} sẽ nghỉ học vào thứ 2 tuần sau do giáo viên có việc đột xuất`,
        type: "class_schedule",
        priority: "high",
        isRead: false,
        relatedId: classes[0]?._id,
        relatedModel: "Class",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: student._id,
        title: "Yêu cầu của bạn đã được phê duyệt",
        message: "Yêu cầu xin nghỉ học của bạn đã được phê duyệt",
        type: "request_response",
        priority: "low",
        isRead: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    await Notification.insertMany(notifications);
    console.log(`✅ Created ${notifications.length} notifications`);

    // ============================
    // BƯỚC 9: Tạo Requests
    // ============================
    console.log("\n📝 Creating requests...");
    await Request.deleteMany({ student: student._id });
    await Request.deleteMany({ student: student._id });

    const requests = [
      {
        student: student._id,
        type: "leave",
        class: classes[0]?._id,
        course: courses[0]?._id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        reason: "Gia đình có việc đột xuất cần về quê",
        status: "approved",
        priority: "normal",
        processedBy: teacherStaff._id,
        processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        student: student._id,
        type: "transfer",
        class: classes[1]?._id,
        course: courses[1]?._id,
        targetClass: classes[2]?._id,
        reason: "Lịch học lớp mới phù hợp hơn với công việc",
        status: "pending",
        priority: "low",
      },
    ];

    // Tạo từng request một để tránh duplicate key error
    for (const requestData of requests) {
      const req = new Request(requestData);
      await req.save();
    }
    console.log(`✅ Created ${requests.length} requests`);

    // ============================
    // SUMMARY
    // ============================
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEED COMPLETED FOR STUDENT1@TEST.COM");
    console.log("=".repeat(50));
    console.log(`
📧 Email: ${student.email}
🔑 Password: ${STUDENT_DATA.password}
👤 Họ tên: ${student.fullName}
📱 SĐT: ${student.phone}
🎂 Ngày sinh: ${student.dateOfBirth.toLocaleDateString("vi-VN")}
🏠 Địa chỉ: ${student.address}

📚 Classes enrolled: ${classes.length}
📅 Schedules: ${schedules.length}
📊 Grades: ${classes.length}
💰 Tuition fees: ${classes.length}
🔔 Notifications: ${notifications.length}
📝 Requests: ${requests.length}
    `);
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
