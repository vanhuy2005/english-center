const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    duration: {
      hours: {
        type: Number,
        default: 60,
      },
      weeks: {
        type: Number,
        default: 12,
      },
    },
    maxStudents: {
      type: Number,
      default: 30,
    },
    // Giá tiền (học phí) - MAIN FIX
    tuition: {
      type: Number,
      required: true,
      min: 0,
      default: 3500000, // Mặc định 3.5 triệu VND
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index cho tìm kiếm nhanh
courseSchema.index({ level: 1, status: 1 });
courseSchema.index({ startDate: 1 });

module.exports = mongoose.model("Course", courseSchema);
