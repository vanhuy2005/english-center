require("dotenv").config();
const mongoose = require("mongoose");
const Grade = require("./src/shared/models/Grade.model");
const Student = require("./src/shared/models/Student.model");
const Class = require("./src/shared/models/Class.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function cleanupTestGrades() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const phone = "0987665432";
    const student = await Student.findOne({ phone });

    if (!student) {
      console.log("❌ Student not found");
      process.exit(1);
    }

    console.log(`🧹 Cleaning up test grades for ${student.fullName}\n`);

    // Find all grades
    const grades = await Grade.find({ student: student._id }).populate(
      "class",
      "name classCode"
    );

    console.log(`Found ${grades.length} grades:\n`);

    // Group by class
    const gradesByClass = {};
    grades.forEach((g) => {
      const classId = g.class?._id?.toString();
      if (classId) {
        if (!gradesByClass[classId]) {
          gradesByClass[classId] = [];
        }
        gradesByClass[classId].push(g);
      }
    });

    // For each class, keep only one grade (the one without scores or the most recent)
    for (const classId in gradesByClass) {
      const classGrades = gradesByClass[classId];
      const className = classGrades[0]?.class?.name || "Unknown";

      console.log(`📚 Class: ${className} - ${classGrades.length} grade(s)`);

      if (classGrades.length > 1) {
        // Sort by: grades without scores first, then by creation date (newest first)
        classGrades.sort((a, b) => {
          const aHasScores = a.scores?.midterm || a.scores?.final;
          const bHasScores = b.scores?.midterm || b.scores?.final;

          if (!aHasScores && bHasScores) return -1;
          if (aHasScores && !bHasScores) return 1;

          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Keep the first one, delete the rest
        const keepGrade = classGrades[0];
        const deleteGrades = classGrades.slice(1);

        console.log(
          `   ✓ Keeping: ${keepGrade._id} (scores: ${
            keepGrade.scores?.midterm || "none"
          })`
        );

        for (const g of deleteGrades) {
          console.log(
            `   ✗ Deleting: ${g._id} (scores: ${g.scores?.midterm || "none"})`
          );
          await Grade.findByIdAndDelete(g._id);
        }
      } else {
        console.log(`   ✓ Only 1 grade, keeping it`);
      }
      console.log();
    }

    // Reset all remaining grades to in_progress and unpublished if no scores
    const remainingGrades = await Grade.find({ student: student._id });
    console.log(
      `\n🔧 Resetting ${remainingGrades.length} remaining grade(s)...`
    );

    for (const g of remainingGrades) {
      const hasScores = g.scores?.midterm || g.scores?.final;
      if (!hasScores) {
        g.status = "in_progress";
        g.isPublished = false;
        g.totalScore = undefined;
        g.letterGrade = undefined;
        await g.save();
        console.log(`   ✓ Reset grade ${g._id}`);
      }
    }

    await mongoose.connection.close();
    console.log("\n✅ Cleanup complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanupTestGrades();
