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
      enum: ["cash", "bank_transfer", "credit_card", "momo", "refund", "other"],
      required: true,
    },

    // --- BẮT BUỘC PHẢI CÓ 2 TRƯỜNG NÀY ---
    type: {
      type: String,
      enum: ["tuition", "refund", "other"],
      default: "tuition",
    },
    status: {
      type: String,
      enum: ["active", "refunded", "cancelled"],
      default: "active",
    },
    // ---------------------------------------

    description: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
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

      if (counter && counter.seq) {
        this.receiptNumber = `RCP${year}${month}${String(counter.seq).padStart(
          4,
          "0"
        )}`;
      } else {
        // Fallback if counter creation fails
        this.receiptNumber = `RCP${year}${month}${Date.now()
          .toString()
          .slice(-4)}`;
      }
    } catch (err) {
      console.error("Error generating receipt number:", err);
      // Fallback: generate receipt number from timestamp
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      this.receiptNumber = `RCP${year}${month}${Date.now()
        .toString()
        .slice(-4)}`;
    }
  }
  next();
});

module.exports = mongoose.model("Receipt", receiptSchema);
