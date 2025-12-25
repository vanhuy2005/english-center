const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./src/shared/models/Student.model");

const createStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const phone = "0900000001";
    const password = "123456";

    // Check if exists
    const existing = await Student.findOne({ phone });
    if (existing) {
      console.log(
        `Student with phone ${phone} already exists. Updating password...`
      );
      existing.password = password; // Middleware will hash this
      existing.isFirstLogin = true; // Reset to first login to test flow
      await existing.save();
      console.log("Password updated to '123456'");
    } else {
      console.log("Creating new student...");

      const newStudent = await Student.create({
        fullName: "Sinh Viên Test Login",
        phone: phone,
        password: password, // Middleware will hash this
        email: "student.test@example.com",
        studentCode: "HVTEST001",
        dateOfBirth: new Date("2000-01-01"),
        gender: "male",
        address: "123 Test Street",
        status: "active",
        isFirstLogin: true,
      });
      console.log("Student created successfully");
    }

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log(`Phone:    ${phone}`);
    console.log(`Password: ${password}`);
    console.log("=========================\n");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
};

createStudent();
