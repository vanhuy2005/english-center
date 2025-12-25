#!/usr/bin/env node
/**
 * QUICK SEED REVENUE DATA
 * Tạo nhanh dữ liệu Finance để test Revenue Report
 */

require("dotenv").config();
const connectDB = require("../src/config/database");
const Finance = require("../src/shared/models/Finance.model");
const Student = require("../src/shared/models/Student.model");
const Class = require("../src/shared/models/Class.model");
const Course = require("../src/shared/models/Course.model");
const Staff = require("../src/shared/models/Staff.model");

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

(async () => {
  try {
    console.log("🚀 Starting Quick Revenue Seed...");
    await connectDB();

    // Check if we already have enough data
    const existingCount = await Finance.countDocuments({ status: "paid" });
    if (existingCount >= 50) {
      console.log(
        `✅ Already have ${existingCount} finance records. Skipping...`
      );
      process.exit(0);
    }

    // Fetch base data
    const students = await Student.find().limit(30);
    const classes = await Class.find().populate("course").limit(10);
    const courses = await Course.find().limit(10);
    const staff =
      (await Staff.findOne({ staffType: "director" })) ||
      (await Staff.findOne({ staffType: "accountant" })) ||
      (await Staff.findOne());

    if (students.length === 0) {
      console.error("❌ No students found. Please run seedStudent.js first.");
      process.exit(1);
    }

    if (!staff) {
      console.error(
        "❌ No staff found. Please run seedDirector.js or create a staff account first."
      );
      process.exit(1);
    }

    console.log(
      `📊 Found ${students.length} students, ${classes.length} classes, ${courses.length} courses`
    );

    const finances = [];
    const today = new Date();

    // Tạo dữ liệu cho 12 tháng gần nhất
    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const targetMonth = new Date(
        today.getFullYear(),
        today.getMonth() - monthOffset,
        1
      );
      const daysInMonth = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0
      ).getDate();

      // Mỗi tháng tạo 5-10 giao dịch
      const txCount = getRandomInt(5, 10);

      for (let i = 0; i < txCount; i++) {
        const student = getRandomItem(students);
        const cls = classes.length > 0 ? getRandomItem(classes) : null;

        // Lấy course từ class hoặc random từ danh sách courses
        const course =
          cls?.course?._id ||
          (courses.length > 0 ? getRandomItem(courses)._id : null);

        if (!course) continue; // Skip nếu không có course

        // Học phí từ 2M - 8M
        const amount = getRandomInt(20, 80) * 100000;

        // Random ngày trong tháng
        const day = getRandomInt(1, daysInMonth);
        const txDate = new Date(
          targetMonth.getFullYear(),
          targetMonth.getMonth(),
          day
        );

        finances.push({
          student: student._id,
          course: course,
          amount: amount,
          paidAmount: amount,
          type: "tuition",
          status: "paid",
          paymentMethod: getRandomItem(["cash", "bank_transfer", "momo"]),
          paidDate: txDate,
          description: `Học phí tháng ${
            targetMonth.getMonth() + 1
          }/${targetMonth.getFullYear()}`,
          createdBy: staff._id,
          createdAt: txDate,
          updatedAt: txDate,
        });
      }
    }

    // Insert all at once
    const inserted = await Finance.insertMany(finances);
    console.log(`✅ Successfully created ${inserted.length} finance records`);

    // Show summary by month
    const summary = await Finance.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$paidDate" },
            month: { $month: "$paidDate" },
          },
          count: { $sum: 1 },
          total: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    console.log("\n📈 Revenue Summary:");
    summary.forEach((m) => {
      const amount = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(m.total);
      console.log(
        `  ${m._id.month}/${m._id.year}: ${m.count} records - ${amount}`
      );
    });

    console.log("\n🎉 Revenue data seeding completed!");
    console.log("👉 Now you can test Revenue Report page");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
})();
