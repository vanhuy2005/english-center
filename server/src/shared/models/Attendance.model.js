const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: [true, "Attendance status is required"],
      default: "present",
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    note: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance records
// Normalize date to start of day before saving
attendanceSchema.pre("save", function (next) {
  if (this.date) {
    const normalized = new Date(this.date);
    normalized.setHours(0, 0, 0, 0);
    this.date = normalized;
  }
  next();
});
attendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });

// Index for querying attendance by class and date
attendanceSchema.index({ class: 1, date: -1 });

// Index for student attendance history
attendanceSchema.index({ student: 1, date: -1 });

// Method to check if student is late
attendanceSchema.methods.isLate = function (scheduledTime) {
  if (!this.checkInTime) return false;

  // Validate scheduledTime format
  if (
    typeof scheduledTime !== "string" ||
    !/^\d{1,2}:\d{2}$/.test(scheduledTime)
  ) {
    // Per project convention, return false or throw TypeError
    return false;
    // Or: throw new TypeError("scheduledTime must be in HH:mm format");
  }
  const parts = scheduledTime.split(":");
  if (parts.length !== 2) return false;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return false;
    // Or: throw new TypeError("scheduledTime hours/minutes out of range");
  }

  const scheduled = new Date(this.date);
  scheduled.setHours(hours, minutes, 0, 0);

  return this.checkInTime > scheduled;
};

// Static method to get attendance statistics for a student
attendanceSchema.statics.getStudentStats = async function (studentId, classId) {
  const stats = await this.aggregate([
    {
      $match: {
        student: new mongoose.Types.ObjectId(studentId),
        ...(classId && { class: new mongoose.Types.ObjectId(classId) }),
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceRate: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  if (result.total > 0) {
    result.attendanceRate = Math.round(
      ((result.present + result.late) / result.total) * 100
    );
  }

  return result;
};

// Static method to get class attendance for a specific date
attendanceSchema.statics.getClassAttendance = async function (classId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    class: classId,
    date: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("student", "studentCode fullName")
    .populate("recordedBy", "fullName");
};

module.exports = mongoose.model("Attendance", attendanceSchema);
