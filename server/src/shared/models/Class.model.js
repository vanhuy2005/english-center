const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    classCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        enrolledDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["active", "completed", "dropped"],
          default: "active",
        },
      },
    ],
    capacity: {
      max: {
        type: Number,
        required: [true, "Capacity is required"],
        min: [1, "Capacity must be at least 1"],
        default: 20,
      },
      current: {
        type: Number,
        default: 0,
      },
    },
    room: {
      type: String,
      trim: true,
    },
    schedule: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6, // 0 = Sunday, 6 = Saturday
        },
        startTime: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              // HH:mm format, 00:00 to 23:59
              return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: "Start time must be in HH:mm format (00:00-23:59).",
          },
        },
        endTime: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              // HH:mm format, 00:00 to 23:59
              return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: "End time must be in HH:mm format (00:00-23:59).",
          },
        },
        room: {
          type: String,
          trim: true,
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Staff",
        },
      },
    ],
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-validate hook for endDate > startDate
classSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

// Auto-generate class code
const Counter = require("./Counter.model");

classSchema.pre("save", async function (next) {
  if (!this.classCode) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "classCode" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.classCode = `CLS${counter.seq}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Virtual for current enrollment count
classSchema.virtual("enrollmentCount").get(function () {
  const students = this.students || [];
  return students.filter((s) => s && s.status === "active").length;
});

// Virtual for available seats (uses capacity.max)
classSchema.virtual("availableSeats").get(function () {
  const max =
    this.capacity && typeof this.capacity === "object"
      ? this.capacity.max
      : this.capacity || 0;
  return max - this.enrollmentCount;
});

// Virtual for is full
classSchema.virtual("isFull").get(function () {
  const max =
    this.capacity && typeof this.capacity === "object"
      ? this.capacity.max
      : this.capacity || 0;
  return this.enrollmentCount >= max;
});

// Method to check if class can accept new student
classSchema.methods.canAcceptStudent = function () {
  return (
    !this.isFull && (this.status === "ongoing" || this.status === "upcoming")
  );
};

// Indexes
classSchema.index({ course: 1, status: 1 });
classSchema.index({ teacher: 1, status: 1 });
classSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Class", classSchema);
