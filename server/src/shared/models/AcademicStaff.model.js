const mongoose = require("mongoose");

/**
 * Academic Staff Schema
 * Nhân viên học vụ - Quản lý điểm danh, điểm số, yêu cầu học viên
 */
const academicStaffSchema = new mongoose.Schema(
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
      default: "Phòng Học vụ",
    },
    position: {
      type: String,
      default: "Nhân viên Học vụ",
    },
    responsibilities: {
      type: [String],
      default: [
        "Quản lý điểm danh",
        "Quản lý điểm số",
        "Xử lý yêu cầu học viên",
        "Theo dõi tiến độ học tập",
      ],
    },
    managedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    performanceMetrics: {
      totalRequestsProcessed: {
        type: Number,
        default: 0,
      },
      thisMonthRequests: {
        type: Number,
        default: 0,
      },
      averageResponseTime: {
        type: Number, // in hours
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
academicStaffSchema.index({ user: 1 });
academicStaffSchema.index({ staffCode: 1 });
academicStaffSchema.index({ employmentStatus: 1 });

// Virtual populate for user info
academicStaffSchema.virtual("userInfo", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("AcademicStaff", academicStaffSchema);
