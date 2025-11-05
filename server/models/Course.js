const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      unique: true,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    description: String,
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "TOEIC", "IELTS"],
    },
    duration: {
      type: Number,
      required: true, // Số tuần
    },
    tuition: {
      type: Number,
      required: true,
    },
    maxStudents: Number,
    currentStudents: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Sắp khai giảng", "Đang diễn ra", "Kết thúc"],
      default: "Sắp khai giảng",
    },
    startDate: Date,
    endDate: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
