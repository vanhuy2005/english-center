const mongoose = require("mongoose");

/**
 * Enrollment Staff Schema
 * Nhân viên tuyển sinh - Quản lý ghi danh học viên
 */
const enrollmentStaffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    staffCode: {
      type: String,
      unique: true,
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: {
      type: String,
      trim: true,
    },
    employmentStatus: {
      type: String,
      enum: ["active", "on_leave", "resigned"],
      default: "active",
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
    dateLeft: {
      type: Date,
    },
    department: {
      type: String,
      default: "Phòng Tuyển sinh",
    },
    position: {
      type: String,
      default: "Nhân viên Tuyển sinh",
    },
    performanceMetrics: {
      totalEnrollments: {
        type: Number,
        default: 0,
      },
      thisMonthEnrollments: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
enrollmentStaffSchema.index({ user: 1 });
enrollmentStaffSchema.index({ staffCode: 1 });
enrollmentStaffSchema.index({ employmentStatus: 1 });

// Virtual populate for user info
enrollmentStaffSchema.virtual("userInfo", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("EnrollmentStaff", enrollmentStaffSchema);
