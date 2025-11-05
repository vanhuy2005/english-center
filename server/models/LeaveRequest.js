const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["nghỉ_phép", "nghỉ_ốm", "nghỉ_lý_do"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Đang chờ duyệt", "Đã duyệt", "Từ chối"],
      default: "Đang chờ duyệt",
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
    numberOfDays: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
