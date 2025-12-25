require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./src/shared/models/Student.model");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/english-center-db";

async function testAPICall() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const phone = "0987665432";
    const student = await Student.findOne({ phone });

    if (!student) {
      console.log("❌ Student not found");
      process.exit(1);
    }

    console.log(`📋 Student: ${student.fullName}`);
    console.log(`   ID: ${student._id}\n`);

    // Create token
    const token = jwt.sign(
      { _id: student._id, role: "student" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    console.log(`🔑 Token created\n`);

    // Call API
    try {
      const response = await axios.get("http://localhost:5000/api/grades/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`✅ API Response:`);
      console.log(`   Success: ${response.data.success}`);
      console.log(`   Data count: ${response.data.data?.length || 0}`);

      if (response.data.data && response.data.data.length > 0) {
        console.log(`\n📊 Grades:`);
        response.data.data.forEach((g, idx) => {
          console.log(`   ${idx + 1}. Class: ${g.class?.name || "N/A"}`);
          console.log(`      Course: ${g.course?.name || "N/A"}`);
          console.log(`      Midterm: ${g.scores?.midterm || "N/A"}`);
          console.log(`      Final: ${g.scores?.final || "N/A"}`);
          console.log(`      Total: ${g.totalScore || "N/A"}`);
        });
      }
    } catch (apiError) {
      console.error(
        `❌ API Error:`,
        apiError.response?.data || apiError.message
      );
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testAPICall();
