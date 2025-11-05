const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const staffSchema = new mongoose.Schema(
  {
    staffId: {
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
    department: {
      type: String,
      enum: ["Học vụ", "Kế toán", "Ghi danh", "Quản lý"],
      required: true,
    },
    position: String,
    salary: Number,
    startDate: Date,
    status: {
      type: String,
      enum: ["Đang làm việc", "Tạm dừng", "Nghỉ việc"],
      default: "Đang làm việc",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash mật khẩu trước khi lưu
staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức so sánh mật khẩu
staffSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo staffId tự động
staffSchema.pre("save", async function (next) {
  if (!this.staffId) {
    const count = await mongoose.model("Staff").countDocuments();
    this.staffId = `NV${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Staff", staffSchema);
