const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
};

const checkStudent = async () => {
  await connectDB();

  try {
    const Student = require("./src/shared/models/Student.model");
    const Class = require("./src/shared/models/Class.model");
    const Grade = require("./src/shared/models/Grade.model");
    const Course = require("./src/shared/models/Course.model");

    const student = await Student.findOne({ phone: "0900000001" });
    if (!student) {
      console.log("❌ Student not found");
      process.exit(1);
    }

    console.log(`\n✅ Student: ${student.fullName} (${student.phone})`);
    console.log(`   ID: ${student._id}\n`);

    // Check enrollments (classes where student is enrolled)
    const enrolledClasses = await Class.find({
      "students.student": student._id,
    })
      .populate("course", "name code")
      .lean();

    console.log(`📚 ENROLLED CLASSES: ${enrolledClasses.length}`);
    enrolledClasses.forEach((cls, idx) => {
      const enrollment = cls.students.find(
        (s) => s.student.toString() === student._id.toString()
      );
      console.log(
        `   ${idx + 1}. ${cls.name} (${cls.course?.code}) - Status: ${
          enrollment?.status
        }`
      );
    });

    // Check grades
    const grades = await Grade.find({ student: student._id })
      .populate("course", "name code")
      .lean();

    console.log(`\n📊 GRADE RECORDS: ${grades.length}`);
    grades.forEach((g, idx) => {
      console.log(
        `   ${idx + 1}. ${g.course?.name} (${g.course?.code}) - Status: ${
          g.status
        }, Score: ${g.totalScore?.toFixed(1) || "N/A"}`
      );
    });

    // Check mismatch
    if (enrolledClasses.length !== grades.length) {
      console.log(`\n⚠️  MISMATCH DETECTED!`);
      console.log(
        `   Enrolled in ${enrolledClasses.length} classes but only ${grades.length} grade records`
      );
      console.log(`\n🔧 Suggested fixes:`);
      if (enrolledClasses.length > grades.length) {
        console.log(`   1. Remove extra enrollments (keep only 5 classes)`);
        console.log(`   2. OR create grades for the missing classes`);
      } else {
        console.log(`   1. Remove extra grades`);
        console.log(`   2. OR enroll student in more classes`);
      }
    } else {
      console.log(`\n✅ Data is synchronized!`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkStudent();
