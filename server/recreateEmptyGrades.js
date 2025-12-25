require("dotenv").config();
const mongoose = require("mongoose");
const Grade = require("./src/shared/models/Grade.model");
const Student = require("./src/shared/models/Student.model");
const Class = require("./src/shared/models/Class.model");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function recreateEmptyGrades() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const phone = "0987665432";
    const student = await Student.findOne({ phone });

    if (!student) {
      console.log("❌ Student not found");
      process.exit(1);
    }

    console.log(`📋 Student: ${student.fullName}\n`);

    // Find classes student is in
    const classes = await Class.find({
      "students.student": student._id,
    });

    console.log(`🏫 Found ${classes.length} classes\n`);

    for (const cls of classes) {
      // Check if grade already exists
      const existingGrade = await Grade.findOne({
        student: student._id,
        class: cls._id,
      });

      if (existingGrade) {
        console.log(`   ✓ Grade exists for ${cls.name}`);
        continue;
      }

      // Create empty grade
      await Grade.create({
        student: student._id,
        class: cls._id,
        course: cls.course,
        status: "in_progress",
        isPublished: false,
      });

      console.log(`   ✅ Created empty grade for ${cls.name}`);
    }

    console.log("\n✅ Done!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

recreateEmptyGrades();
