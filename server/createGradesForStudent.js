require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./src/shared/models/Student.model");
const Grade = require("./src/shared/models/Grade.model");
const Class = require("./src/shared/models/Class.model");
const Course = require("./src/shared/models/Course.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function createGradesForStudent() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const phone = "0987665432";

    // 1. Tìm student
    const student = await Student.findOne({ phone });

    if (!student) {
      console.log(`❌ Không tìm thấy student với số điện thoại ${phone}`);
      process.exit(1);
    }

    console.log(`📋 Student: ${student.fullName} (${student.studentCode})\n`);

    // 2. Tìm các lớp mà student tham gia
    const classes = await Class.find({
      "students.student": student._id,
    });

    if (classes.length === 0) {
      console.log("❌ Student chưa được xếp vào lớp nào");
      process.exit(1);
    }

    console.log(`🏫 Tìm thấy ${classes.length} lớp học. Tạo grades...\n`);

    for (const cls of classes) {
      // Get course info
      const course = await Course.findById(cls.course);

      // Kiểm tra xem đã có grade chưa
      const existingGrade = await Grade.findOne({
        student: student._id,
        class: cls._id,
      });

      if (existingGrade) {
        console.log(
          `  ✓ Lớp ${cls.name} - Đã có grades (${existingGrade._id})`
        );
        continue;
      }

      // Tạo grade mới với điểm ngẫu nhiên
      const midtermScore = Math.floor(Math.random() * 3) + 7; // 7-9
      const finalScore = Math.floor(Math.random() * 3) + 7; // 7-9
      const overallScore = ((midtermScore + finalScore) / 2).toFixed(1);

      const grade = await Grade.create({
        student: student._id,
        class: cls._id,
        course: cls.course,
        scores: {
          midterm: midtermScore,
          final: finalScore,
        },
        status: "in_progress",
        isPublished: true,
        publishedDate: new Date(),
      });

      console.log(`  ✅ Tạo grades cho lớp ${cls.name}`);
      console.log(`     - Course: ${course?.name || "N/A"}`);
      console.log(`     - Midterm: ${midtermScore}`);
      console.log(`     - Final: ${finalScore}`);
      console.log(`     - Overall: ${overallScore}`);
    }

    console.log("\n✅ Hoàn thành!");

    // Hiển thị tổng kết
    const totalGrades = await Grade.countDocuments({ student: student._id });
    console.log(`\n📊 Tổng số grades: ${totalGrades}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createGradesForStudent();
