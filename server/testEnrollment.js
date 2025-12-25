require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./src/shared/models/Student.model");

async function testEnrollmentData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const now = new Date();
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    console.log("\n📊 Enrollment Data by Month:");
    console.log("================================");

    for (let i = 11; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = month > currentMonth ? currentYear - 1 : currentYear;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const newCount = await Student.countDocuments({
        enrollmentDate: { $gte: firstDay, $lte: lastDay },
        academicStatus: "active",
      });

      const activeCount = await Student.countDocuments({
        academicStatus: "active",
        enrollmentDate: { $lte: lastDay },
      });

      console.log(`${months[month]}: New=${newCount}, Active=${activeCount}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testEnrollmentData();
