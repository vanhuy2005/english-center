const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Staff Schema - Unified model for all staff types
 * Nhân viên - Model thống nhất cho tất cả loại nhân viên (bao gồm cả thông tin đăng nhập)
 */
const staffSchema = new mongoose.Schema(
  {
    // Authentication fields
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[A-Za-z]{2,})+$/,
        "Email không hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      default: "123456",
      select: false,
    },
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"],
    },
    avatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    // Staff specific fields
    staffCode: {
      type: String,
      unique: true,
      required: true,
    },
    staffType: {
      type: String,
      enum: ["academic", "accountant", "enrollment", "director", "teacher"],
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
    },
    position: {
      type: String,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    // Academic Staff specific
    managedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    // Teacher specific
    teachingClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    specialization: {
      type: [String],
      default: [],
    },
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    experience: {
      years: Number,
      description: String,
    },
    // Accountant specific
    accessLevel: {
      type: String,
      enum: ["standard", "senior", "manager"],
    },
    // Performance metrics (all staff types)
    performanceMetrics: {
      // Academic
      totalRequestsProcessed: Number,
      thisMonthRequests: Number,
      averageResponseTime: Number,
      // Accountant
      totalTransactions: Number,
      thisMonthTransactions: Number,
      totalAmountProcessed: Number,
      // Enrollment
      totalEnrollments: Number,
      thisMonthEnrollments: Number,
      conversionRate: Number,
      // Teacher
      totalClassesTaught: Number,
      totalStudentsTaught: Number,
      averageRating: Number,
      attendanceRate: Number,
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
staffSchema.index({ phone: 1 });
staffSchema.index({ email: 1 });
staffSchema.index({ staffCode: 1 });
staffSchema.index({ staffType: 1 });
staffSchema.index({ employmentStatus: 1 });

// Hash password before save
staffSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Set default department and position based on staffType
  if (this.isNew && !this.department) {
    switch (this.staffType) {
      case "academic":
        this.department = "Phòng Học vụ";
        this.position = this.position || "Nhân viên Học vụ";
        if (!this.responsibilities.length) {
          this.responsibilities = [
            "Quản lý điểm danh",
            "Quản lý điểm số",
            "Xử lý yêu cầu học viên",
            "Theo dõi tiến độ học tập",
          ];
        }
        break;
      case "accountant":
        this.department = "Phòng Kế toán";
        this.position = this.position || "Nhân viên Kế toán";
        this.accessLevel = this.accessLevel || "standard";
        if (!this.responsibilities.length) {
          this.responsibilities = [
            "Quản lý học phí",
            "Xử lý thanh toán",
            "Báo cáo tài chính",
            "Kiểm tra công nợ",
          ];
        }
        break;
      case "enrollment":
        this.department = "Phòng Tuyển sinh";
        this.position = this.position || "Nhân viên Tuyển sinh";
        if (!this.responsibilities.length) {
          this.responsibilities = [
            "Tư vấn khóa học",
            "Xử lý đăng ký",
            "Chăm sóc khách hàng",
            "Báo cáo tuyển sinh",
          ];
        }
        break;
      case "teacher":
        this.department = "Phòng Giảng dạy";
        this.position = this.position || "Giảng viên";
        if (!this.responsibilities.length) {
          this.responsibilities = [
            "Giảng dạy",
            "Chấm điểm",
            "Quản lý lớp học",
            "Báo cáo tiến độ",
          ];
        }
        break;
      case "teacher":
        this.department = "Phòng Giảng dạy";
        this.position = this.position || "Giảng viên";
        if (!this.responsibilities.length) {
          this.responsibilities = [
            "Giảng dạy",
            "Chấm điểm",
            "Quản lý lớp học",
            "Báo cáo tiến độ",
          ];
        }
        break;
    }
  }
  next();
});

// Method to compare password
staffSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
staffSchema.methods.getPublicProfile = function () {
  const staff = this.toObject();
  delete staff.password;
  delete staff.refreshToken;
  delete staff.__v;
  return staff;
};

module.exports = mongoose.model("Staff", staffSchema);
