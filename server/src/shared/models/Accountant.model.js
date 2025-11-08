const mongoose = require("mongoose");

/**
 * Accountant Schema
 * Nhân viên kế toán - Quản lý tài chính, học phí, thu chi
 */
const accountantSchema = new mongoose.Schema(
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
      default: "Phòng Kế toán",
    },
    position: {
      type: String,
      default: "Nhân viên Kế toán",
    },
    responsibilities: {
      type: [String],
      default: [
        "Quản lý học phí",
        "Xử lý thanh toán",
        "Báo cáo tài chính",
        "Kiểm tra công nợ",
      ],
    },
    accessLevel: {
      type: String,
      enum: ["standard", "senior", "manager"],
      default: "standard",
    },
    performanceMetrics: {
      totalTransactions: {
        type: Number,
        default: 0,
      },
      thisMonthTransactions: {
        type: Number,
        default: 0,
      },
      totalAmountProcessed: {
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
accountantSchema.index({ user: 1 });
accountantSchema.index({ staffCode: 1 });
accountantSchema.index({ employmentStatus: 1 });

// Virtual populate for user info
accountantSchema.virtual("userInfo", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Accountant", accountantSchema);
