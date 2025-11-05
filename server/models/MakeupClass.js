const mongoose = require("mongoose");

const makeupClassSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Đang chờ duyệt", "Được duyệt", "Từ chối", "Hoàn thành"],
      default: "Đang chờ duyệt",
    },
    approvedDate: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MakeupClass", makeupClassSchema);
