const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Student Schema
 * Thông tin chi tiết về học viên (bao gồm cả thông tin đăng nhập)
 */
const studentSchema = new mongoose.Schema(
  {
    // Authentication fields
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[A-Za-z]{2,})+$/,
        "Email không hợp lệ",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      default: "123456",
      select: false,
    },
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"],
    },
    avatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    // Student specific fields
    studentCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
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
      enum: ["active", "inactive", "paused", "on-leave", "completed", "dropped"],
      default: "inactive",
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
studentSchema.index({ phone: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ academicStatus: 1 });

// Auto-generate studentCode
const Counter = require("./Counter.model");

studentSchema.pre("save", async function (next) {
  // Hash password if modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Auto-generate studentCode
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

// Method to compare password
studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
studentSchema.methods.getPublicProfile = function () {
  const student = this.toObject();
  delete student.password;
  delete student.refreshToken;
  delete student.__v;
  return student;
};

// Method to check if student can enroll in a course
studentSchema.methods.canEnrollCourse = function (courseId) {
  return !this.enrolledCourses.some(
    (course) => course.toString() === courseId.toString()
  );
};

module.exports = mongoose.model("Student", studentSchema);
