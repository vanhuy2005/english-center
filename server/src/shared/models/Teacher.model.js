const mongoose = require("mongoose");

/**
 * Teacher Schema
 * Thông tin chi tiết về giảng viên
 */
const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    teacherCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    specialization: [
      {
        type: String,
        trim: true,
      },
    ],
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    experience: {
      years: {
        type: Number,
        default: 0,
      },
      description: String,
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    schedule: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
      },
    ],
    salary: {
      base: Number,
      bonuses: [
        {
          amount: Number,
          reason: String,
          date: Date,
        },
      ],
    },
    performance: {
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      feedbacks: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Feedback",
        },
      ],
    },
    employmentStatus: {
      type: String,
      enum: ["active", "on-leave", "resigned", "terminated"],
      default: "active",
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
teacherSchema.index({ teacherCode: 1 });
teacherSchema.index({ user: 1 });
teacherSchema.index({ employmentStatus: 1 });

// Auto-generate teacherCode
const Counter = require("./Counter.model");

teacherSchema.pre("save", async function (next) {
  if (!this.teacherCode) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        "teacher",
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.teacherCode = `GV${String(counter.seq).padStart(5, "0")}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Virtual for total classes
teacherSchema.virtual("totalClasses").get(function () {
  return this.classes ? this.classes.length : 0;
});

// Method to check if teacher is available
teacherSchema.methods.isAvailable = function (date, time) {
  // Logic to check schedule availability
  return true; // Placeholder
};

module.exports = mongoose.model("Teacher", teacherSchema);
