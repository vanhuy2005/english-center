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
      },
      participation: {
        type: Number,
        min: 0,
        max: 100,
      },
      homework: {
        type: Number,
        min: 0,
        max: 100,
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
      ref: "Staff",
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

  let totalWeightedScore = 0;
  let totalWeight = 0;

  // Helper to check if a score is valid (not null/undefined)
  const isValid = (val) => val !== undefined && val !== null;

  if (isValid(s.attendance)) {
    totalWeightedScore += s.attendance * w.attendance;
    totalWeight += w.attendance;
  }
  if (isValid(s.participation)) {
    totalWeightedScore += s.participation * w.participation;
    totalWeight += w.participation;
  }
  if (isValid(s.homework)) {
    totalWeightedScore += s.homework * w.homework;
    totalWeight += w.homework;
  }
  if (isValid(s.midterm)) {
    totalWeightedScore += s.midterm * w.midterm;
    totalWeight += w.midterm;
  }
  if (isValid(s.final)) {
    totalWeightedScore += s.final * w.final;
    totalWeight += w.final;
  }

  // Only calculate if we have at least one score and total weight > 0
  if (totalWeight > 0) {
    // Normalize to 10 scale
    // Example: 9*40 + 10*60 = 960. Total weight = 100. Result = 9.6
    // Example: 9*30 + 10*40 = 670. Total weight = 70. Result = 9.57
    this.totalScore = totalWeightedScore / totalWeight;

    // Round to 1 decimal place
    this.totalScore = Math.round(this.totalScore * 10) / 10;

    // Calculate letter grade
    this.letterGrade = this.calculateLetterGrade(this.totalScore);

    // Don't automatically change status - let staff/teacher control this
    // Status should only be set manually or when explicitly published
  } else {
    // If no scores, keep as in_progress (don't reset if already set)
    this.totalScore = undefined;
    this.letterGrade = undefined;
    if (!this.status || this.status === undefined) {
      this.status = "in_progress";
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
  // Scale 10
  if (score >= 9.5) return "A+";
  if (score >= 9.0) return "A";
  if (score >= 8.5) return "B+";
  if (score >= 8.0) return "B";
  if (score >= 7.5) return "C+";
  if (score >= 7.0) return "C";
  if (score >= 6.5) return "D+";
  if (score >= 6.0) return "D";
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
  return this.totalScore >= 5.0;
});

// Compound index to prevent duplicate grades
gradeSchema.index({ student: 1, class: 1, course: 1 }, { unique: true });

// Indexes for querying
gradeSchema.index({ student: 1, isPublished: 1 });
gradeSchema.index({ class: 1, isPublished: 1 });
gradeSchema.index({ course: 1, status: 1 });

// Static method to get student transcript
gradeSchema.statics.getStudentTranscript = async function (studentId) {
  const mongoose = require("mongoose");
  const Student = require("./Student.model");

  let resolvedId = studentId;

  // If studentId is not a valid ObjectId, try resolving by studentCode
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    try {
      const found = await Student.findOne({ studentCode: studentId }).select(
        "_id"
      );
      if (found) resolvedId = found._id;
      else {
        // If not found by code, return empty
        return [];
      }
    } catch (err) {
      console.warn(
        "getStudentTranscript: could not resolve studentId:",
        err.message
      );
      return [];
    }
  }

  const allGrades = await this.find({
    student: resolvedId,
  })
    .sort({ isPublished: -1, updatedAt: -1 })
    .populate("class", "name classCode")
    .populate("course", "name courseCode level")
    .populate("gradedBy", "fullName");

  // Filter: only return grades with at least one score
  return allGrades.filter((g) => {
    const s = g.scores || {};
    return (
      (s.midterm !== null && s.midterm !== undefined) ||
      (s.final !== null && s.final !== undefined) ||
      (s.attendance !== null && s.attendance !== undefined) ||
      (s.participation !== null && s.participation !== undefined) ||
      (s.homework !== null && s.homework !== undefined)
    );
  });
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
