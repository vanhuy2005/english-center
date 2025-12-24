const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    requestCode: {
      type: String,
      unique: true,
      uppercase: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },
    type: {
      type: String,
      enum: [
        "leave",
        "makeup",
        "transfer",
        "pause",
        "resume",
        "withdrawal",
        "course_enrollment",
        "consultation",
        "reserve",
        "other",
      ],
      required: [true, "Request type is required"],
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    targetClass: {
      // For transfer requests
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    // Optional free-text reason or message. For 'consultation' it may be omitted and
    // a separate 'additionalNote' field may be used.
    reason: {
      type: String,
      trim: true,
    },
    // Consultation specific fields
    contactPhone: {
      type: String,
      trim: true,
    },
    preferredDate: {
      type: Date,
    },
    additionalNote: {
      type: String,
      trim: true,
    },
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    approvedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    responseNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook for request-type-specific validation and date range
requestSchema.pre("save", function (next) {
  // Date range validation
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    return next(new Error("Start date must be before end date"));
  }

  // Type-specific required fields
  switch (this.type) {
    case "course_enrollment":
      if (!this.course) {
        return next(new Error("Course is required for enrollment requests"));
      }
      break;
    case "transfer":
      if (!this.targetClass) {
        return next(
          new Error("Target class is required for transfer requests")
        );
      }
      break;
    case "leave":
    case "pause":
    case "resume":
      if (!this.startDate) {
        return next(
          new Error(
            `${
              this.type.charAt(0).toUpperCase() + this.type.slice(1)
            } requests require startDate`
          )
        );
      }
      break;
    case "makeup":
      if (!this.class) {
        return next(new Error("Class is required for makeup requests"));
      }
      if (!this.startDate) {
        return next(
          new Error("Date is required for makeup requests (use startDate)")
        );
      }
      break;
  }

  // Enforce 'reason' for request types that require it. 'consultation' and 'other' may omit reason
  const typesRequiringReason = [
    "leave",
    "makeup",
    "transfer",
    "pause",
    "resume",
    "withdrawal",
    "course_enrollment",
    "reserve",
  ];
  if (
    typesRequiringReason.includes(this.type) &&
    (!this.reason || !this.reason.trim())
  ) {
    return next(new Error("Reason is required"));
  }

  next();
});
// Auto-generate request code
const Counter = require("./Counter.model");
requestSchema.pre("save", async function (next) {
  if (!this.requestCode) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const key = `request_${year}${month}`;
      const counter = await Counter.findByIdAndUpdate(
        key,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.requestCode = `REQ${year}${month}${String(counter.seq).padStart(
        5,
        "0"
      )}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Set approved date when status changes to approved
requestSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "approved" &&
    !this.approvedDate
  ) {
    this.approvedDate = new Date();
  }
  next();
});

// Virtual for is pending
requestSchema.virtual("isPending").get(function () {
  return this.status === "pending";
});

// Virtual for is approved
requestSchema.virtual("isApproved").get(function () {
  return this.status === "approved";
});

// Virtual for request age in days
requestSchema.virtual("requestAge").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to approve request
requestSchema.methods.approve = function (userId, note) {
  this.status = "approved";
  this.processedBy = userId;
  this.approvedDate = new Date();
  if (note) this.responseNote = note;
  return this.save();
};

// Method to reject request
requestSchema.methods.reject = function (userId, reason, note) {
  this.status = "rejected";
  this.processedBy = userId;
  this.rejectionReason = reason;
  if (note) this.responseNote = note;
  return this.save();
};

// Static method to get pending requests count
requestSchema.statics.getPendingCount = async function (filters = {}) {
  return this.countDocuments({ status: "pending", ...filters });
};

// Static method to get student request history
requestSchema.statics.getStudentHistory = async function (
  studentId,
  limit = 10
) {
  return this.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("class", "name classCode")
    .populate("targetClass", "name classCode")
    .populate("processedBy", "fullName");
};

// Indexes
requestSchema.index({ student: 1, status: 1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("Request", requestSchema);
