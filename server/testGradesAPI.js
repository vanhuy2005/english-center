require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./src/shared/models/Student.model");
const Grade = require("./src/shared/models/Grade.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function testGradesAPI() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const phone = "0987665432";
    const student = await Student.findOne({ phone });

    if (!student) {
      console.log("❌ Student not found");
      process.exit(1);
    }

    console.log(`📋 Student: ${student.fullName} (ID: ${student._id})\n`);

    // Check all grades
    const allGrades = await Grade.find({ student: student._id });
    console.log(`📊 All grades: ${allGrades.length}`);
    allGrades.forEach((g) => {
      console.log(`  - isPublished: ${g.isPublished}, class: ${g.class}`);
    });

    // Check published grades
    const publishedGrades = await Grade.find({
      student: student._id,
      isPublished: true,
    });
    console.log(`\n📢 Published grades: ${publishedGrades.length}`);

    // Update all grades to published
    if (allGrades.length > 0 && publishedGrades.length === 0) {
      console.log("\n🔧 Setting all grades to published...");
      await Grade.updateMany(
        { student: student._id },
        { isPublished: true, publishedDate: new Date() }
      );
      console.log("✅ All grades are now published!");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testGradesAPI();
