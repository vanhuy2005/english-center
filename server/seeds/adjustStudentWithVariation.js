require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../src/shared/models/Student.model");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/english-center";

async function adjustStudentEnrollmentDatesWithVariation() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all students
    const students = await Student.find();
    console.log(`📊 Found ${students.length} students`);

    const currentYear = 2025;
    let updatedCount = 0;

    // Phân bổ học sinh vào 12 tháng với variation tự nhiên
    const activePercentage = 0.75; // 75% active, 25% completed
    const activeCount = Math.floor(students.length * activePercentage);
    const completedCount = students.length - activeCount;

    // Create more natural distribution: some months have more/less students
    // Thực tế: tháng 9, 10, 11, 12 có nhiều đăng ký; tháng 6, 7, 8 ít hơn
    const monthVariation = [8, 9, 10, 12, 14, 13, 11, 10, 9, 11, 12, 14];
    const totalFromVariation = monthVariation.reduce((a, b) => a + b, 0);

    // Normalize to activeCount
    const scaleFactor = activeCount / totalFromVariation;
    const monthCounts = monthVariation.map((count) =>
      Math.round(count * scaleFactor)
    );

    // Adjust last month to ensure exact total
    let currentTotal = monthCounts.slice(0, 11).reduce((a, b) => a + b, 0);
    monthCounts[11] = activeCount - currentTotal;

    console.log("📅 Monthly distribution:", monthCounts);

    let studentIndex = 0;

    // Distribute active students across 12 months with variation
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthCount = monthCounts[monthIndex];

      for (let i = 0; i < monthCount; i++) {
        if (studentIndex >= students.length) break;

        const student = students[studentIndex];
        const day = Math.floor(Math.random() * 28) + 1; // 1-28
        const enrollmentDate = new Date(currentYear, monthIndex, day);

        student.enrollmentDate = enrollmentDate;
        student.academicStatus = "active";

        await student.save();
        studentIndex++;
        updatedCount++;

        if (updatedCount % 20 === 0) {
          console.log(
            `⏳ Updated ${updatedCount}/${students.length} students...`
          );
        }
      }
    }

    // Assign remaining students as completed (from previous years)
    const remainingStudents = students.length - studentIndex;
    console.log(`\n📊 Assigning ${remainingStudents} students as completed...`);

    for (let i = 0; i < remainingStudents; i++) {
      const student = students[studentIndex + i];
      const monthIndex = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      const enrollmentDate = new Date(currentYear - 1, monthIndex, day);

      student.enrollmentDate = enrollmentDate;
      student.academicStatus = "completed";

      await student.save();
      updatedCount++;
    }

    console.log(`
✅ Adjustment with variation completed:
   - Total students: ${students.length}
   - Active students: ${studentIndex} (75%)
   - Completed students: ${completedCount} (25%)
   - Distribution varies by month (8-14 students per month)
    `);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

adjustStudentEnrollmentDatesWithVariation();
