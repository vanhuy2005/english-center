const mongoose = require("mongoose");

/**
 * Payment Schema
 * Quản lý các thanh toán
 */
const paymentSchema = new mongoose.Schema(
  {
    paymentCode: {
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
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    description: String,
    note: String,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    confirmedAt: Date,
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

// Auto-generate payment code
const Counter = require("./Counter.model");

paymentSchema.pre("save", async function (next) {
  if (!this.paymentCode) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const counterId = `payment_${year}${month}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.paymentCode = `PAY${year}${month}${String(counter.seq).padStart(
        4,
        "0"
      )}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
