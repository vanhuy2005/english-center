require("dotenv").config();
const mongoose = require("mongoose");
const Grade = require("./src/shared/models/Grade.model");
const Student = require("./src/shared/models/Student.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function checkGradeStatus() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const phone = "0987665432";
    const student = await Student.findOne({ phone });

    if (!student) {
      console.log("❌ Student not found");
      process.exit(1);
    }

    const grades = await Grade.find({ student: student._id });

    console.log(`📊 Grades for ${student.fullName}:\n`);
    grades.forEach((g, idx) => {
      console.log(`${idx + 1}. Grade ID: ${g._id}`);
      console.log(`   Status: ${g.status}`);
      console.log(`   Midterm: ${g.scores?.midterm || "N/A"}`);
      console.log(`   Final: ${g.scores?.final || "N/A"}`);
      console.log(`   Total: ${g.totalScore || "N/A"}`);
      console.log(`   isPublished: ${g.isPublished}`);
      console.log();
    });

    // Fix status to in_progress if no scores
    console.log("🔧 Fixing status to in_progress...\n");
    for (const g of grades) {
      if (!g.scores?.midterm && !g.scores?.final) {
        g.status = "in_progress";
        g.isPublished = false;
        await g.save();
        console.log(`✅ Fixed grade ${g._id}`);
      }
    }

    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkGradeStatus();
