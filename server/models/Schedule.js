const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    dayOfWeek: {
      type: Number,
      enum: [2, 3, 4, 5, 6, 7],
      required: true, // 2=Thứ 2, 3=Thứ 3, ..., 7=Thứ 7
    },
    dayName: String, // "Thứ 2", "Thứ 3", etc
    startTime: {
      type: String,
      required: true, // "09:00"
    },
    endTime: {
      type: String,
      required: true, // "11:00"
    },
    semester: Number,
    course: String,
    credits: Number,
    teacher: String,
    status: {
      type: String,
      enum: ["Đang diễn ra", "Sắp tới", "Kết thúc"],
      default: "Đang diễn ra",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
