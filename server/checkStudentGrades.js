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

async function checkStudentGrades() {
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

    console.log("📋 THÔNG TIN HỌC SINH:");
    console.log(`  - ID: ${student._id}`);
    console.log(`  - Họ tên: ${student.fullName}`);
    console.log(`  - Mã học viên: ${student.studentCode}`);
    console.log(`  - Số khóa học: ${student.enrolledCourses?.length || 0}`);

    // 2. Kiểm tra grades
    console.log("\n📊 KIỂM TRA ĐIỂM SỐ:");
    const grades = await Grade.find({ student: student._id })
      .populate("class", "name classCode")
      .populate("course", "name courseCode")
      .sort({ createdAt: -1 });

    console.log(`  - Tổng số bản ghi điểm: ${grades.length}`);

    if (grades.length > 0) {
      console.log("\n📝 CHI TIẾT ĐIỂM:");
      grades.forEach((grade, idx) => {
        console.log(`\n  ${idx + 1}. Class: ${grade.class?.name || "N/A"}`);
        console.log(`     - Course: ${grade.course?.name || "N/A"}`);
        console.log(`     - Midterm: ${grade.scores?.midterm || "N/A"}`);
        console.log(`     - Final: ${grade.scores?.final || "N/A"}`);
        console.log(`     - Total: ${grade.totalScore || "N/A"}`);
        console.log(`     - Status: ${grade.status || "N/A"}`);
      });
    } else {
      console.log("  ⚠️  Không có điểm nào cho student này");
    }

    // 3. Kiểm tra classes mà student tham gia
    console.log("\n🏫 KIỂM TRA LỚP HỌC:");
    const classes = await Class.find({
      "students.student": student._id,
    }).populate("course", "name courseCode");

    console.log(`  - Số lớp tham gia: ${classes.length}`);

    if (classes.length > 0) {
      console.log("\n📚 CHI TIẾT LỚP:");
      for (const cls of classes) {
        console.log(`\n  - Lớp: ${cls.name} (${cls.classCode})`);
        console.log(`    Course: ${cls.course?.name || "N/A"}`);

        // Kiểm tra xem có grades cho lớp này không
        const gradeForClass = await Grade.findOne({
          student: student._id,
          class: cls._id,
        });
        console.log(`    Has grades: ${gradeForClass ? "Yes" : "No"}`);

        if (!gradeForClass) {
          console.log(`    ⚠️  Cần tạo grade record cho lớp này`);
        }
      }
    }

    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkStudentGrades();
