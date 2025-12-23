const mongoose = require("mongoose");
require("dotenv").config();

const Course = require("../models/Course");

const seedCourses = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/english_center"
    );
    console.log("✓ Kết nối MongoDB thành công");

    // Xóa dữ liệu cũ
    await Course.deleteMany({});
    console.log("✓ Xóa dữ liệu khóa học cũ");

    // Xóa các index cũ nếu có conflict
    try {
      await Course.collection.dropIndexes();
      console.log("✓ Xóa indexes cũ");
    } catch (err) {
      console.log("ℹ️  Không cần xóa indexes");
    }

    // Seed dữ liệu mới
    const courses = [
      {
        name: "English A1",
        description: "Khóa học tiếng Anh sơ cấp cho người mới bắt đầu",
        level: "beginner",
        duration: { hours: 60, weeks: 12 },
        maxStudents: 30,
        tuition: 3500000, // 3.5 triệu VND
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        name: "English A2",
        description: "Khóa học tiếng Anh sơ cấp nâng cao",
        level: "beginner",
        duration: { hours: 60, weeks: 12 },
        maxStudents: 30,
        tuition: 3500000, // 3.5 triệu VND
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        name: "English B1",
        description: "Khóa học tiếng Anh trung cấp",
        level: "intermediate",
        duration: { hours: 80, weeks: 16 },
        maxStudents: 25,
        tuition: 4500000, // 4.5 triệu VND
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
      {
        name: "English B2",
        description: "Khóa học tiếng Anh trung cấp nâng cao",
        level: "intermediate",
        duration: { hours: 80, weeks: 16 },
        maxStudents: 25,
        tuition: 4500000, // 4.5 triệu VND
        startDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      },
      {
        name: "English C1",
        description: "Khóa học tiếng Anh nâng cao",
        level: "advanced",
        duration: { hours: 100, weeks: 20 },
        maxStudents: 20,
        tuition: 6000000, // 6 triệu VND
        startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      },
    ];

    await Course.insertMany(courses);
    console.log("✓ Đã thêm " + courses.length + " khóa học");

    console.log("\n✓ Seed dữ liệu thành công!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Lỗi seed dữ liệu:", error.message);
    process.exit(1);
  }
};

seedCourses();
