const mongoose = require("mongoose");

/**
 * Grade Schema
 * Quản lý điểm số và đánh giá học viên
 */
const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    // Component scores
    scores: {
      attendance: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      participation: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      homework: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      midterm: {
        type: Number,
        min: 0,
        max: 100,
      },
      final: {
        type: Number,
        min: 0,
        max: 100,
      },
      // Skills breakdown
      listening: {
        type: Number,
        min: 0,
        max: 100,
      },
      speaking: {
        type: Number,
        min: 0,
        max: 100,
      },
      reading: {
        type: Number,
        min: 0,
        max: 100,
      },
      writing: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    // Weighted calculation
    weights: {
      attendance: { type: Number, default: 10 },
      participation: { type: Number, default: 10 },
      homework: { type: Number, default: 10 },
      midterm: { type: Number, default: 30 },
      final: { type: Number, default: 40 },
    },
    totalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    letterGrade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"],
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "failed"],
      default: "in_progress",
    },
    // Feedback and comments
    teacherComment: {
      type: String,
      trim: true,
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    // Tracking
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gradedDate: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total score before saving
gradeSchema.pre("save", function (next) {
  const s = this.scores;
  const w = this.weights;

  // Only calculate if we have required scores
  if (
    s.attendance !== undefined &&
    s.participation !== undefined &&
    s.homework !== undefined &&
    s.midterm !== undefined &&
    s.final !== undefined
  ) {
    this.totalScore =
      (s.attendance * w.attendance +
        s.participation * w.participation +
        s.homework * w.homework +
        s.midterm * w.midterm +
        s.final * w.final) /
      100;

    // Calculate letter grade
    this.letterGrade = this.calculateLetterGrade(this.totalScore);

    // Determine status
    if (this.totalScore < 50) {
      this.status = "failed";
    } else if (this.final !== undefined && this.final > 0) {
      this.status = "completed";
    }
  }

  // Set graded date if not already set and scores are entered
  if (!this.gradedDate && this.totalScore !== undefined) {
    this.gradedDate = new Date();
  }

  // Set published date when published
  if (this.isPublished && !this.publishedDate) {
    this.publishedDate = new Date();
  }

  next();
});

// Method to calculate letter grade
gradeSchema.methods.calculateLetterGrade = function (score) {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 65) return "D+";
  if (score >= 60) return "D";
  return "F";
};

// Virtual for skills average
gradeSchema.virtual("skillsAverage").get(function () {
  const skills = [
    this.scores.listening,
    this.scores.speaking,
    this.scores.reading,
    this.scores.writing,
  ].filter((s) => s !== undefined && s !== null);

  if (skills.length === 0) return 0;
  return Math.round(skills.reduce((a, b) => a + b, 0) / skills.length);
});

// Virtual for pass/fail
gradeSchema.virtual("isPassing").get(function () {
  return this.totalScore >= 60;
});

// Compound index to prevent duplicate grades
gradeSchema.index({ student: 1, class: 1, course: 1 }, { unique: true });

// Indexes for querying
gradeSchema.index({ student: 1, isPublished: 1 });
gradeSchema.index({ class: 1, isPublished: 1 });
gradeSchema.index({ course: 1, status: 1 });

// Static method to get student transcript
gradeSchema.statics.getStudentTranscript = async function (studentId) {
  return this.find({
    student: studentId,
    isPublished: true,
  })
    .sort({ createdAt: -1 })
    .populate("class", "name classCode")
    .populate("course", "name courseCode level")
    .populate("gradedBy", "fullName");
};

// Static method to get class grade report
gradeSchema.statics.getClassReport = async function (classId) {
  const grades = await this.find({
    class: classId,
  })
    .populate("student", "studentCode fullName email")
    .sort({ totalScore: -1 });

  const stats = {
    total: grades.length,
    passed: grades.filter((g) => g.isPassing).length,
    failed: grades.filter((g) => !g.isPassing).length,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
  };

  if (grades.length > 0) {
    const scores = grades
      .map((g) => g.totalScore)
      .filter((s) => s !== undefined);
    stats.averageScore =
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    stats.highestScore = Math.max(...scores);
    stats.lowestScore = Math.min(...scores);
  }

  return { grades, stats };
};

// Static method to calculate class average
gradeSchema.statics.getClassAverage = async function (classId) {
  const result = await this.aggregate([
    { $match: { class: new mongoose.Types.ObjectId(classId) } },
    {
      $group: {
        _id: null,
        avgTotal: { $avg: "$totalScore" },
        avgAttendance: { $avg: "$scores.attendance" },
        avgParticipation: { $avg: "$scores.participation" },
        avgHomework: { $avg: "$scores.homework" },
        avgMidterm: { $avg: "$scores.midterm" },
        avgFinal: { $avg: "$scores.final" },
      },
    },
  ]);

  return result[0] || {};
};

module.exports = mongoose.model("Grade", gradeSchema);
