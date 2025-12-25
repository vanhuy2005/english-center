require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../src/shared/models/Student.model");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/english-center";

async function adjustStudentEnrollmentDates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all students
    const students = await Student.find();
    console.log(`📊 Found ${students.length} students`);

    const currentYear = new Date().getFullYear();
    let updatedCount = 0;
    let graduatedCount = 0;

    // Phân bổ học sinh vào 12 tháng + thêm graduated students
    const activePercentage = 0.75; // 75% active, 25% graduated
    const activeCount = Math.floor(students.length * activePercentage);
    const graduatedStudentCount = students.length - activeCount;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (i < activeCount) {
        // Phân bổ vào 12 tháng (active students)
        const monthIndex = i % 12; // 0-11
        const month = monthIndex + 1; // 1-12

        // Random ngày trong tháng (1-28 để tránh lỗi tháng 2)
        const day = Math.floor(Math.random() * 28) + 1;
        const enrollmentDate = new Date(currentYear, monthIndex, day);

        student.enrollmentDate = enrollmentDate;
        student.academicStatus = "active";
      } else {
        // Graduated students (đã tốt nghiệp - đăng ký từ năm ngoái)
        const monthIndex = Math.floor(Math.random() * 12);
        const month = monthIndex + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const enrollmentDate = new Date(currentYear - 1, monthIndex, day);

        student.enrollmentDate = enrollmentDate;
        student.academicStatus = "completed";
        graduatedCount++;
      }

      await student.save();
      updatedCount++;

      if (updatedCount % 20 === 0) {
        console.log(
          `⏳ Updated ${updatedCount}/${students.length} students...`
        );
      }
    }

    console.log(`
✅ Adjustment completed:
   - Total students: ${students.length}
   - Active students: ${activeCount}
   - Completed students: ${graduatedStudentCount}
   - Active students distributed across 12 months
   - Each month has ~${Math.floor(activeCount / 12)} active students
    `);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

adjustStudentEnrollmentDates();
