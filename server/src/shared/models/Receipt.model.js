const mongoose = require("mongoose");

/**
 * Receipt Schema
 * Quản lý các biên lai thanh toán
 */
const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      unique: true,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "credit_card", "momo", "other"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "voided"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate receipt number
const Counter = require("./Counter.model");

receiptSchema.pre("save", async function (next) {
  if (!this.receiptNumber) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const counterId = `receipt_${year}${month}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.receiptNumber = `RCP${year}${month}${String(counter.seq).padStart(
        4,
        "0"
      )}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Receipt", receiptSchema);
