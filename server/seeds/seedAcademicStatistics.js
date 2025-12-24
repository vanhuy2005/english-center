/* SEED SCRIPT - ACADEMIC STATISTICS
   Mục tiêu: Tạo dữ liệu mẫu (Học viên, Lớp học, Điểm danh, Điểm số) để hiển thị đầy đủ trên trang Thống kê Học vụ.
   Tài khoản test: Trần Thị Academic (NV-ACA002)
   Cách dùng: node server/seeds/seedAcademicStatistics.js
*/

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Staff = require("../src/shared/models/Staff.model");
const Student = require("../src/shared/models/Student.model");
const Class = require("../src/shared/models/Class.model");
const Course = require("../src/shared/models/Course.model");
const Attendance = require("../src/shared/models/Attendance.model");
const Grade = require("../src/shared/models/Grade.model");

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

async function seedData() {
  try {
    // 0. Cleanup old seed data (DISABLED)
    // console.log("🧹 Cleaning up old seed data...");
    // await Class.deleteMany({ classCode: { $regex: /^CLS-STAT-/ } });
    // const deletedStudents = await Student.find({
    //   studentCode: { $regex: /^HV-STAT-/ },
    // });
    // const studentIds = deletedStudents.map((s) => s._id);
    // await Student.deleteMany({ _id: { $in: studentIds } });
    // await Attendance.deleteMany({ student: { $in: studentIds } });
    // await Grade.deleteMany({ student: { $in: studentIds } });

    console.log("✅ Cleanup skipped (Appending data)");

    // 1. Create Academic Staff "Trần Thị Academic"
    const defaultPassword = "123456";
    let staff = await Staff.findOne({ staffCode: "NV-ACA002" });
    if (!staff) {
      staff = new Staff({
        staffCode: "NV-ACA002",
        fullName: "Trần Thị Academic",
        phone: "0903000033",
        email: "tranthiacademic@example.com",
        password: defaultPassword,
        staffType: "academic",
        status: "active",
        dateOfBirth: new Date("1992-05-15"),
        address: "Phòng Đào tạo",
      });
      await staff.save();
      console.log("✅ Created Academic staff: Trần Thị Academic (NV-ACA002)");
    } else {
      staff.fullName = "Trần Thị Academic";
      staff.password = defaultPassword;
      staff.status = "active";
      await staff.save();
      console.log("ℹ️  Updated Academic staff: Trần Thị Academic");
    }

    // 2. Ensure some Courses exist and have tuition fees
    await Course.updateMany(
      { tuitionFee: { $exists: false } },
      { $set: { tuitionFee: 2500000 } }
    );
    let courses = await Course.find();
    if (courses.length === 0) {
      const newCourse = await Course.create({
        name: "English Communication Basic",
        courseCode: "EC-BASIC",
        level: "basic",
        description: "Basic communication skills",
        tuitionFee: 2000000,
        duration: { weeks: 12, hours: 36 },
      });
      courses = [newCourse];
      console.log("✅ Created sample Course");
    } else {
      console.log(
        `ℹ️  Found ${courses.length} courses. Updated tuition fees if missing.`
      );
    }

    // 3. Create Classes
    const classes = [];
    for (let i = 1; i <= 5; i++) {
      let cls = await Class.findOne({ classCode: `CLS-STAT-${i}` });
      if (!cls) {
        cls = await Class.create({
          name: `Lớp Giao Tiếp K${i}`,
          classCode: `CLS-STAT-${i}`,
          course: courses[0]._id,
          teacher: staff._id, // Assign to academic temporarily or find a teacher
          startDate: new Date("2023-09-01"),
          endDate: new Date("2023-12-01"),
          status: "ongoing",
          capacity: { max: 20, current: 0 },
          schedule: [
            {
              dayOfWeek: 1,
              startTime: "18:00",
              endTime: "19:30",
              room: "P101",
            },
            {
              dayOfWeek: 3,
              startTime: "18:00",
              endTime: "19:30",
              room: "P101",
            },
          ],
        });
      }
      classes.push(cls);
    }
    console.log(`✅ Created/Found ${classes.length} Classes`);

    // 4. Create Students and Enroll (Spread over last 8 months)
    const students = [];
    const today = new Date();

    // Create 150 students (Increased from 60 to add more data)
    for (let i = 1; i <= 150; i++) {
      const studentCode = `HV-STAT-${String(i).padStart(3, "0")}`;
      let student = await Student.findOne({ studentCode });

      // Random createdAt within last 8 months
      const monthsBack = Math.floor(Math.random() * 8); // 0 to 7
      const createdDate = new Date();
      createdDate.setMonth(today.getMonth() - monthsBack);
      createdDate.setDate(Math.floor(Math.random() * 28) + 1);

      if (!student) {
        student = await Student.create({
          studentCode,
          fullName: `Học Viên Thống Kê ${i}`,
          phone: `0999000${String(i).padStart(3, "0")}`,
          email: `student.stat.${i}@example.com`,
          password: defaultPassword,
          dateOfBirth: new Date("2005-01-01"),
          status: "active",
          academicStatus: "active",
          createdAt: createdDate, // Override createdAt
        });
        // Mongoose might overwrite createdAt if timestamps: true, so we update it explicitly
        await Student.updateOne(
          { _id: student._id },
          { $set: { createdAt: createdDate } }
        );
      } else {
        // Update existing student's createdAt to ensure distribution
        await Student.updateOne(
          { _id: student._id },
          { $set: { createdAt: createdDate } }
        );
      }
      students.push(student);

      // Enroll in a random class
      const randomClass = classes[Math.floor(Math.random() * classes.length)];

      // Update Class
      if (
        !randomClass.students.some(
          (s) => s.student.toString() === student._id.toString()
        )
      ) {
        randomClass.students.push({ student: student._id, status: "active" });
        randomClass.capacity.current += 1;
        await randomClass.save();
      }

      // Update Student
      if (!student.enrolledCourses.includes(randomClass.course)) {
        student.enrolledCourses.push(randomClass.course);
        await student.save();
      }

      // 5. Create Attendance Records (Last 30 days for trend)
      // Create attendance for the last 7 days specifically for the chart
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);

        // Random status: 80% present, 10% absent, 10% late
        const rand = Math.random();
        const status = rand > 0.2 ? "present" : rand > 0.1 ? "absent" : "late";

        // Only create if not exists
        const existing = await Attendance.findOne({
          student: student._id,
          class: randomClass._id,
          date: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        });

        if (!existing) {
          await Attendance.create({
            student: student._id,
            class: randomClass._id,
            date: date,
            status: status,
            recordedBy: staff._id,
          });
        }
      }

      // 6. Create Grade Record
      const score = Math.floor(Math.random() * 5) + 5; // 5 to 10
      // Check if grade exists
      const existingGrade = await Grade.findOne({
        student: student._id,
        class: randomClass._id,
      });
      if (!existingGrade) {
        await Grade.create({
          student: student._id,
          class: randomClass._id,
          course: randomClass.course,
          type: "final",
          name: "Final Exam",
          totalScore: score,
          isPublished: true,
          gradedBy: staff._id,
        });
      }
    }
    console.log(
      `✅ Created/Updated ${students.length} Students with Attendance & Grades`
    );

    console.log("🎉 Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

connectDB().then(seedData);
