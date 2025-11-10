const mongoose = require("mongoose");

/**
 * Schedule Schema
 * Lịch học chi tiết cho từng buổi học của lớp
 */
const scheduleSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: "Start time must be in HH:mm format (00:00-23:59)",
      },
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: "End time must be in HH:mm format (00:00-23:59)",
      },
    },
    room: {
      type: String,
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled", "postponed"],
      default: "scheduled",
    },
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
    materials: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["document", "video", "audio", "link", "other"],
        },
      },
    ],
    homework: {
      title: String,
      description: String,
      dueDate: Date,
      attachments: [
        {
          name: String,
          url: String,
        },
      ],
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Validation: endTime > startTime
scheduleSchema.pre("validate", function (next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(":").map(Number);
    const [endHour, endMin] = this.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return next(new Error("End time must be after start time"));
    }
  }
  next();
});

// Indexes
scheduleSchema.index({ class: 1, date: 1 });
scheduleSchema.index({ teacher: 1, date: 1 });
scheduleSchema.index({ date: 1, status: 1 });
scheduleSchema.index({ room: 1, date: 1, startTime: 1 });

// Virtual for duration in minutes
scheduleSchema.virtual("duration").get(function () {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(":").map(Number);
    const [endHour, endMin] = this.endTime.split(":").map(Number);
    return endHour * 60 + endMin - (startHour * 60 + startMin);
  }
  return 0;
});

// Virtual for full datetime start
scheduleSchema.virtual("dateTimeStart").get(function () {
  if (this.date && this.startTime) {
    const [hours, minutes] = this.startTime.split(":").map(Number);
    const dt = new Date(this.date);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  }
  return null;
});

// Virtual for full datetime end
scheduleSchema.virtual("dateTimeEnd").get(function () {
  if (this.date && this.endTime) {
    const [hours, minutes] = this.endTime.split(":").map(Number);
    const dt = new Date(this.date);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  }
  return null;
});

// Method to check if session is in the past
scheduleSchema.methods.isPast = function () {
  return this.dateTimeEnd && new Date() > this.dateTimeEnd;
};

// Method to check if session is upcoming
scheduleSchema.methods.isUpcoming = function () {
  return this.dateTimeStart && new Date() < this.dateTimeStart;
};

// Method to check if session is ongoing
scheduleSchema.methods.isOngoing = function () {
  const now = new Date();
  return (
    this.dateTimeStart &&
    this.dateTimeEnd &&
    now >= this.dateTimeStart &&
    now <= this.dateTimeEnd
  );
};

// Static method to get teacher schedule for date range
scheduleSchema.statics.getTeacherSchedule = async function (
  teacherId,
  startDate,
  endDate
) {
  return this.find({
    teacher: teacherId,
    date: { $gte: startDate, $lte: endDate },
    status: { $nin: ["cancelled"] },
  })
    .sort({ date: 1, startTime: 1 })
    .populate("class", "name classCode")
    .populate("teacher", "fullName");
};

// Static method to get class schedule for date range
scheduleSchema.statics.getClassSchedule = async function (
  classId,
  startDate,
  endDate
) {
  return this.find({
    class: classId,
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: 1, startTime: 1 })
    .populate("teacher", "fullName");
};

// Static method to check room availability
scheduleSchema.statics.isRoomAvailable = async function (
  room,
  date,
  startTime,
  endTime,
  excludeScheduleId = null
) {
  const query = {
    room,
    date,
    status: { $nin: ["cancelled"] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      { startTime: { $gte: startTime, $lt: endTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
    ],
  };

  if (excludeScheduleId) {
    query._id = { $ne: excludeScheduleId };
  }

  const conflict = await this.findOne(query);
  return !conflict;
};

module.exports = mongoose.model("Schedule", scheduleSchema);
