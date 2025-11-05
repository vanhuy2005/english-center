const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
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
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: 6,
      select: false,
    },
    phone: String,
    address: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
    },
    qualifications: [String],
    specialization: [String],
    salary: Number,
    startDate: Date,
    assignedClasses: [mongoose.Schema.Types.ObjectId],
    status: {
      type: String,
      enum: ["Đang dạy", "Tạm dừng", "Nghỉ việc"],
      default: "Đang dạy",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash mật khẩu trước khi lưu
teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức so sánh mật khẩu
teacherSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo teacherId tự động
teacherSchema.pre("save", async function (next) {
  if (!this.teacherId) {
    const count = await mongoose.model("Teacher").countDocuments();
    this.teacherId = `GV${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
