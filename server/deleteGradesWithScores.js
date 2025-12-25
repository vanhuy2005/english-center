require("dotenv").config();
const mongoose = require("mongoose");
const Grade = require("./src/shared/models/Grade.model");
const Student = require("./src/shared/models/Student.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function deleteGradesWithScores() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const phone = "0987665432";
    const student = await Student.findOne({ phone });

    if (!student) {
      console.log("❌ Student not found");
      process.exit(1);
    }

    // Delete all grades that have scores
    const result = await Grade.deleteMany({
      student: student._id,
      $or: [
        { "scores.midterm": { $exists: true, $ne: null } },
        { "scores.final": { $exists: true, $ne: null } },
      ],
    });

    console.log(`🗑️  Deleted ${result.deletedCount} grade(s) with scores`);

    // Show remaining grades
    const remaining = await Grade.find({ student: student._id });
    console.log(`\n📊 Remaining grades: ${remaining.length}`);
    remaining.forEach((g, idx) => {
      console.log(
        `   ${idx + 1}. Status: ${g.status}, isPublished: ${g.isPublished}`
      );
    });

    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

deleteGradesWithScores();
