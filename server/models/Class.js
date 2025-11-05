const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    classId: {
      type: String,
      unique: true,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    schedule: [
      {
        day: String, // T2, T3, ...
        startTime: String,
        endTime: String,
        room: String,
      },
    ],
    startDate: Date,
    endDate: Date,
    maxCapacity: Number,
    status: {
      type: String,
      enum: ["Sắp khai giảng", "Đang diễn ra", "Kết thúc"],
      default: "Sắp khai giảng",
    },
    attendance: [
      {
        studentId: mongoose.Schema.Types.ObjectId,
        date: Date,
        status: {
          type: String,
          enum: ["Có mặt", "Vắng", "Vắng có phép"],
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
