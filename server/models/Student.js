const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    fullName: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Vui lòng nhập email"],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email không hợp lệ",
      ],
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: 6,
      select: false,
    },
    address: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
    },
    enrolledCourses: [
      {
        courseId: mongoose.Schema.Types.ObjectId,
        courseName: String,
        enrollDate: Date,
        status: {
          type: String,
          enum: ["Đang học", "Hoàn thành", "Ngừng học"],
          default: "Đang học",
        },
      },
    ],
    tuitionPaid: {
      type: Number,
      default: 0,
    },
    tuitionOwed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Đang học", "Tạm dừng", "Tốt nghiệp", "Bỏ học"],
      default: "Đang học",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash mật khẩu trước khi lưu
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức so sánh mật khẩu
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo studentId tự động
studentSchema.pre("save", async function (next) {
  if (!this.studentId) {
    const count = await mongoose.model("Student").countDocuments();
    this.studentId = `HV${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
