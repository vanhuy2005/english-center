const mongoose = require("mongoose");
require("dotenv").config();
const Course = require("./models/Course");

const seedCourses = [
  {
    courseName: "TOEIC 600+",
    level: "Intermediate",
    description: "Khóa học chuẩn bị cho kỳ thi TOEIC 600+",
    duration: 12,
    tuition: 3000000,
    maxStudents: 30,
    currentStudents: 15,
    status: "Đang diễn ra",
    startDate: new Date("2024-09-01"),
    endDate: new Date("2024-12-01"),
  },
  {
    courseName: "IELTS 6.5",
    level: "Advanced",
    description: "Khóa học chuẩn bị cho kỳ thi IELTS band 6.5",
    duration: 16,
    tuition: 4000000,
    maxStudents: 25,
    currentStudents: 12,
    status: "Sắp khai giảng",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-05-15"),
  },
  {
    courseName: "Conversational English",
    level: "Beginner",
    description: "Khóa học tiếng Anh giao tiếp cơ bản",
    duration: 8,
    tuition: 2000000,
    maxStudents: 35,
    currentStudents: 28,
    status: "Đang diễn ra",
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-11-26"),
  },
  {
    courseName: "Business English",
    level: "Intermediate",
    description: "Khóa học tiếng Anh kinh doanh",
    duration: 12,
    tuition: 3500000,
    maxStudents: 20,
    currentStudents: 18,
    status: "Sắp khai giảng",
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-05-01"),
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Xóa dữ liệu cũ
    await Course.deleteMany({});

    // Thêm dữ liệu mới
    await Course.insertMany(seedCourses);
    console.log("Seed data inserted successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

connectDB();
