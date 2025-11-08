const mongoose = require("mongoose");

/**
 * TuitionFee Schema
 * Quản lý học phí của học viên
 */
const tuitionFeeSchema = new mongoose.Schema(
  {
    tuitionCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "credit_card", "momo", "other"],
    },
    note: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate tuition code
const Counter = require("./Counter.model");

tuitionFeeSchema.pre("save", async function (next) {
  if (!this.tuitionCode) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const counterId = `tuition_${year}${month}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.tuitionCode = `TF${year}${month}${String(counter.seq).padStart(
        4,
        "0"
      )}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Calculate remaining amount before save
tuitionFeeSchema.pre("save", function (next) {
  if (this.isModified("paidAmount") || this.isModified("amount")) {
    this.remainingAmount = Math.max(0, this.amount - this.paidAmount);

    // Update status based on payment
    if (this.paidAmount === 0) {
      this.status = "unpaid";
    } else if (this.paidAmount >= this.amount) {
      this.status = "paid";
    } else {
      this.status = "partial";
    }
  }
  next();
});

module.exports = mongoose.model("TuitionFee", tuitionFeeSchema);
