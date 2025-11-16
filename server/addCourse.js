require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./src/shared/models/Course.model");

const addCourse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Tạo khóa học General English
    const course = await Course.create({
      name: "General English",
      description: "Khóa học tiếng Anh giao tiếp tổng quát cho người mới bắt đầu và trung cấp",
      level: "intermediate",
      duration: {
        hours: 60,
        weeks: 12,
      },
      schedule: {
        daysPerWeek: 3,
        hoursPerDay: 2,
      },
      fee: {
        amount: 3000000,
        currency: "VND",
      },
      capacity: {
        min: 8,
        max: 20,
      },
      status: "active",
      materials: [
        {
          title: "English Grammar in Use",
          description: "Sách giáo trình ngữ pháp",
          type: "document",
        },
        {
          title: "Listening Practice",
          description: "Bài tập luyện nghe",
          type: "audio",
        },
      ],
    });

    console.log("✅ Course created successfully!");
    console.log("   Course Code:", course.courseCode);
    console.log("   Name:", course.name);
    console.log("   Level:", course.level);
    console.log("   Duration:", `${course.duration.weeks} weeks (${course.duration.hours} hours)`);
    console.log("   Fee:", `${course.fee.amount.toLocaleString()} ${course.fee.currency}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

addCourse();
