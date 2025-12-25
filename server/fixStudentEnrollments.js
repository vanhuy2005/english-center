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

const fixEnrollments = async () => {
  await connectDB();

  try {
    const Student = require("./src/shared/models/Student.model");
    const Class = require("./src/shared/models/Class.model");
    const Grade = require("./src/shared/models/Grade.model");

    const student = await Student.findOne({ phone: "0900000001" });
    if (!student) {
      console.log("❌ Student not found");
      process.exit(1);
    }

    console.log(`\n✅ Student: ${student.fullName}`);

    // Get all grades for this student
    const grades = await Grade.find({ student: student._id }).lean();
    const gradeClassIds = grades.map((g) => g.class.toString());

    console.log(`\n📊 Found ${grades.length} grade records for student`);
    console.log(
      `   Classes with grades: ${gradeClassIds.join(", ").substring(0, 50)}...`
    );

    // Remove student from all classes
    const removeResult = await Class.updateMany(
      { "students.student": student._id },
      { $pull: { students: { student: student._id } } }
    );

    console.log(
      `\n🗑️  Removed student from ${removeResult.modifiedCount} classes`
    );

    // Re-enroll student only in classes that have grades
    let enrolledCount = 0;
    for (const classId of gradeClassIds) {
      await Class.findByIdAndUpdate(classId, {
        $push: {
          students: {
            student: student._id,
            status: "active",
            enrolledDate: new Date(),
          },
        },
      });
      enrolledCount++;
    }

    console.log(
      `\n✅ Re-enrolled student in ${enrolledCount} classes (matching grade records)`
    );

    // Verify
    const enrolledClasses = await Class.find({
      "students.student": student._id,
    }).lean();

    console.log(`\n📚 Final verification:`);
    console.log(`   - Enrolled classes: ${enrolledClasses.length}`);
    console.log(`   - Grade records: ${grades.length}`);

    if (enrolledClasses.length === grades.length) {
      console.log(`\n✅ SUCCESS! Data is now synchronized!`);
    } else {
      console.log(`\n⚠️  Still mismatched!`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixEnrollments();
