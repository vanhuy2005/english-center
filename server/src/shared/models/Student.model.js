const mongoose = require("mongoose");

/**
 * Student Schema
 * Thông tin chi tiết về học viên
 */
const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    // Denormalized fullName for search performance
    fullName: {
      type: String,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: false, // Không bắt buộc
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false, // Không bắt buộc
    },
    address: {
      type: String,
      trim: true,
    },
    contactInfo: {
      phone: String,
      email: String,
    },
    contactPerson: {
      name: String,
      relation: String,
      phone: String,
      email: String,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    attendance: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
      },
    ],
    financialRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Finance",
      },
    ],
    academicStatus: {
      type: String,
      enum: ["active", "on-leave", "completed", "dropped"],
      default: "active",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
studentSchema.index({ studentCode: 1 });
studentSchema.index({ user: 1 });
studentSchema.index({ academicStatus: 1 });

// Auto-generate studentCode
const Counter = require("./Counter.model");

studentSchema.pre("save", async function (next) {
  if (!this.studentCode) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        "student",
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.studentCode = `HV${String(counter.seq).padStart(5, "0")}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Virtual for age
studentSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Method to check if student can enroll in a course
studentSchema.methods.canEnrollCourse = function (courseId) {
  return !this.enrolledCourses.some(
    (course) => course.toString() === courseId.toString()
  );
};

module.exports = mongoose.model("Student", studentSchema);
