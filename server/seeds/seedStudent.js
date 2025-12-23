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

const STUDENT_DATA = {
  email: "student.test@example.com",
  password: "Student123!",
  fullName: "Nguyễn Văn An",
  phone: "0912000001",
  dateOfBirth: new Date("2000-05-15"),
  gender: "male",
  address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
  contactInfo: {
    phone: "0912000001",
    email: "student.test@example.com",
  },
  contactPerson: {
    name: "Nguyễn Văn Bình",
    relation: "Cha",
    phone: "0913000001",
    email: "parent@example.com",
  },
  academicStatus: "active",
  notes: "Học viên test với đầy đủ thông tin",
};

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // ============================
    // BƯỚC 1: Tạo/Cập nhật Student
    // ============================
    let student = await Student.findOne({ phone: STUDENT_DATA.phone });

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
        startDate.setDate(startDate.getDate() - 60 + i * 30); // Stagger start dates

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 90); // 3 months duration

        classDoc = new Class({
          name: `${course.name} - Lớp ${i + 1}`,
          course: course._id,
          teacher: teacherStaff._id,
          capacity: {
            max: 20,
            current: 0,
          },
          room: `P${100 + i}`,
          schedule: [
            {
              dayOfWeek: (i % 3) * 2 + 1, // Monday, Wednesday, Friday
              startTime: "18:00",
              endTime: "20:00",
            },
          ],
          startDate: startDate,
          endDate: endDate,
          status: i === 0 ? "completed" : i === 1 ? "ongoing" : "upcoming",
        });
        await classDoc.save();
        console.log(`✅ Class created: ${classDoc.name}`);
      }

      // Enroll student in class if not already enrolled
      const alreadyEnrolled = classDoc.students.some(
        (s) => s.student.toString() === student._id.toString()
      );

      if (!alreadyEnrolled) {
        classDoc.students.push({
          student: student._id,
          enrolledDate: classDoc.startDate,
          status: classDoc.status === "completed" ? "completed" : "active",
        });
        classDoc.capacity.current = classDoc.students.length;
        await classDoc.save();
        console.log(`✅ Student enrolled in: ${classDoc.name}`);
      }

      classes.push(classDoc);
    }

    // Update student's enrolled courses
    student.enrolledCourses = courses.map((c) => c._id);
    student.academicStatus = "active";
    await student.save();

    // ============================
    // BƯỚC 4: Tạo Grades (Điểm số)
    // ============================
    for (let i = 0; i < classes.length; i++) {
      const classDoc = classes[i];
      const course = courses[i];

      let grade = await Grade.findOne({
        student: student._id,
        class: classDoc._id,
      });

      const gradeData = {
        student: student._id,
        class: classDoc._id,
        course: course._id,
        scores: {
          attendance: 85 + Math.floor(Math.random() * 10),
          participation: 80 + Math.floor(Math.random() * 15),
          homework: 85 + Math.floor(Math.random() * 10),
          midterm: 75 + Math.floor(Math.random() * 15),
          final: 80 + Math.floor(Math.random() * 15),
          listening: 80 + Math.floor(Math.random() * 15),
          speaking: 75 + Math.floor(Math.random() * 15),
          reading: 85 + Math.floor(Math.random() * 10),
          writing: 78 + Math.floor(Math.random() * 15),
        },
        weights: {
          attendance: 10,
          participation: 10,
          homework: 10,
          midterm: 30,
          final: 40,
        },
        status: classDoc.status === "completed" ? "completed" : "in_progress",
        teacherComment: "Học viên chăm chỉ, có tiến bộ tốt.",
        updatedBy: teacherStaff._id,
      };

      // Calculate total score
      const { scores, weights } = gradeData;
      gradeData.totalScore =
        (scores.attendance * weights.attendance +
          scores.participation * weights.participation +
          scores.homework * weights.homework +
          scores.midterm * weights.midterm +
          scores.final * weights.final) /
        100;

      // Determine letter grade
      if (gradeData.totalScore >= 90) gradeData.letterGrade = "A+";
      else if (gradeData.totalScore >= 85) gradeData.letterGrade = "A";
      else if (gradeData.totalScore >= 80) gradeData.letterGrade = "B+";
      else if (gradeData.totalScore >= 75) gradeData.letterGrade = "B";
      else if (gradeData.totalScore >= 70) gradeData.letterGrade = "C+";
      else if (gradeData.totalScore >= 65) gradeData.letterGrade = "C";
      else if (gradeData.totalScore >= 60) gradeData.letterGrade = "D+";
      else if (gradeData.totalScore >= 50) gradeData.letterGrade = "D";
      else gradeData.letterGrade = "F";

      if (grade) {
        Object.assign(grade, gradeData);
        await grade.save();
        console.log(
          `✅ Grade updated for: ${classDoc.name} - ${gradeData.letterGrade}`
        );
      } else {
        grade = new Grade(gradeData);
        await grade.save();
        console.log(
          `✅ Grade created for: ${classDoc.name} - ${gradeData.letterGrade}`
        );
      }
    }

    // ============================
    // BƯỚC 5: Tạo Attendance (Điểm danh)
    // ============================
    for (const classDoc of classes) {
      const startDate = new Date(classDoc.startDate);
      const endDate =
        classDoc.status === "completed"
          ? new Date(classDoc.endDate)
          : new Date();

      const totalSessions = 24; // Giả sử mỗi lớp có 24 buổi học
      const sessionInterval = Math.floor(
        (endDate - startDate) / (totalSessions * 24 * 60 * 60 * 1000)
      );

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      for (let session = 0; session < totalSessions; session++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(sessionDate.getDate() + session * sessionInterval);

        if (sessionDate > endDate) break;

        // Skip if attendance already exists
        const existingAttendance = await Attendance.findOne({
          student: student._id,
          class: classDoc._id,
          date: {
            $gte: new Date(sessionDate.setHours(0, 0, 0, 0)),
            $lt: new Date(sessionDate.setHours(23, 59, 59, 999)),
          },
        });

        if (existingAttendance) continue;

        // 85% present, 10% late, 5% absent
        const rand = Math.random();
        let status, checkInTime;

        if (rand < 0.85) {
          status = "present";
          presentCount++;
          checkInTime = new Date(sessionDate);
          checkInTime.setHours(18, 0 - Math.floor(Math.random() * 5), 0, 0); // Đến sớm 0-5 phút
        } else if (rand < 0.95) {
          status = "late";
          lateCount++;
          checkInTime = new Date(sessionDate);
          checkInTime.setHours(18, 5 + Math.floor(Math.random() * 10), 0, 0); // Muộn 5-15 phút
        } else {
          status = "absent";
          absentCount++;
          checkInTime = null;
        }

        const attendance = new Attendance({
          student: student._id,
          class: classDoc._id,
          date: sessionDate,
          status: status,
          checkInTime: checkInTime,
          checkOutTime: checkInTime
            ? new Date(checkInTime.getTime() + 2 * 60 * 60 * 1000)
            : null,
          note: status === "late" ? "Đến muộn" : "",
          recordedBy: teacherStaff._id,
        });

        await attendance.save();
      }

      console.log(
        `✅ Attendance created for ${classDoc.name}: ${presentCount} present, ${lateCount} late, ${absentCount} absent`
      );
    }

    // ============================
    // BƯỚC 6: Tạo Tuition Fees (Học phí)
    // ============================
    for (let i = 0; i < classes.length; i++) {
      const classDoc = classes[i];
      const course = courses[i];

      let tuition = await TuitionFee.findOne({
        student: student._id,
        class: classDoc._id,
      });

      if (!tuition) {
        const tuitionAmount = course.tuition || 3500000;
        const isPaid = i === 0; // Lớp đầu tiên đã thanh toán đủ
        const isPartial = i === 1; // Lớp thứ hai thanh toán một phần

        tuition = new TuitionFee({
          student: student._id,
          class: classDoc._id,
          amount: tuitionAmount,
          paidAmount: isPaid
            ? tuitionAmount
            : isPartial
            ? tuitionAmount * 0.5
            : 0,
          dueDate: new Date(
            classDoc.startDate.getTime() + 7 * 24 * 60 * 60 * 1000
          ), // 7 days after start
          status: isPaid ? "paid" : isPartial ? "partial" : "unpaid",
          paymentMethod: isPaid
            ? "bank_transfer"
            : isPartial
            ? "cash"
            : undefined,
          note: isPaid
            ? "Đã thanh toán đủ"
            : isPartial
            ? "Đã thanh toán 50%"
            : "Chưa thanh toán",
        });

        await tuition.save();
        console.log(
          `✅ Tuition fee created for ${classDoc.name}: ${
            tuition.status
          } - ${tuition.paidAmount.toLocaleString()}đ / ${tuition.amount.toLocaleString()}đ`
        );
      }
    }

    // ============================
    // BƯỚC 7: Tạo Payments (Thanh toán)
    // ============================
    const paidTuition = await TuitionFee.findOne({
      student: student._id,
      status: { $in: ["paid", "partial"] },
    });

    if (paidTuition) {
      const existingPayment = await Payment.findOne({
        student: student._id,
        class: paidTuition.class,
      });

      if (!existingPayment) {
        const payment = new Payment({
          student: student._id,
          class: paidTuition.class,
          amount: paidTuition.paidAmount,
          paymentMethod: "bank_transfer",
          status: "confirmed",
          description: "Thanh toán học phí",
          confirmedBy: teacherStaff._id,
          confirmedAt: new Date(),
          createdBy: student._id,
        });

        await payment.save();
        console.log(
          `✅ Payment created: ${
            payment.paymentCode
          } - ${payment.amount.toLocaleString()}đ`
        );
      }
    }

    // ============================
    // SUMMARY
    // ============================
    console.log("\n" + "=".repeat(60));
    console.log("✅ SEED STUDENT COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 SUMMARY:");
    console.log(`👤 Student: ${student.fullName} (${student.studentCode})`);
    console.log(`📧 Email: ${student.email}`);
    console.log(`📱 Phone: ${student.phone}`);
    console.log(`🔑 Password: Student123!`);
    console.log(`\n📚 Enrolled Courses: ${classes.length}`);

    for (let i = 0; i < classes.length; i++) {
      const classDoc = classes[i];
      const grade = await Grade.findOne({
        student: student._id,
        class: classDoc._id,
      });
      const tuition = await TuitionFee.findOne({
        student: student._id,
        class: classDoc._id,
      });

      console.log(`\n   ${i + 1}. ${classDoc.name}`);
      console.log(`      Status: ${classDoc.status}`);
      console.log(
        `      Grade: ${grade?.letterGrade || "N/A"} (${
          grade?.totalScore?.toFixed(1) || "N/A"
        })`
      );
      console.log(
        `      Tuition: ${
          tuition?.status
        } - ${tuition?.paidAmount?.toLocaleString()}đ / ${tuition?.amount?.toLocaleString()}đ`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 You can now login with:");
    console.log("   Email: student.test@example.com");
    console.log("   Password: Student123!");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    console.error(err);
    process.exit(1);
  }
})();
