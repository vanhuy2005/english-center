const mongoose = require("mongoose");

/**
 * Course Schema
 * Thông tin về các khóa học
 */
const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Tên khóa học là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: [
        "beginner",
        "elementary",
        "pre-intermediate",
        "intermediate",
        "upper-intermediate",
        "advanced",
      ],
      required: true,
    },
    duration: {
      hours: {
        type: Number,
        required: true,
      },
      weeks: {
        type: Number,
        required: true,
      },
    },
    schedule: {
      daysPerWeek: Number,
      hoursPerDay: Number,
    },
    fee: {
      amount: {
        type: Number,
        required: [true, "Học phí là bắt buộc"],
      },
      currency: {
        type: String,
        default: "VND",
      },
    },
    capacity: {
      min: {
        type: Number,
        default: 5,
      },
      max: {
        type: Number,
        default: 20,
      },
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    materials: [
      {
        title: String,
        description: String,
        url: String,
        type: {
          type: String,
          enum: ["document", "video", "audio", "other"],
        },
      },
    ],
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "upcoming", "archived"],
      default: "active",
    },
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
courseSchema.index({ courseCode: 1 });
courseSchema.index({ level: 1, status: 1 });
courseSchema.index({ name: "text", description: "text" });

// Virtual for enrolled students count
courseSchema.virtual("enrolledCount").get(function () {
  if (!this.classes || !Array.isArray(this.classes)) return 0;

  return this.classes.reduce((total, classItem) => {
    // Check if classItem is populated (has students array) or just ObjectId
    if (classItem && typeof classItem === "object" && classItem.students) {
      return (
        total +
        (Array.isArray(classItem.students) ? classItem.students.length : 0)
      );
    }
    return total;
  }, 0);
});

// Auto-generate courseCode
const Counter = require("./Counter.model");
courseSchema.pre("save", async function (next) {
  if (!this.courseCode) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "courseCode" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.courseCode = `COURSE${String(counter.seq).padStart(4, "0")}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
