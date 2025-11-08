const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Base User Schema
 * Chứa thông tin chung cho tất cả users (Student, Teacher, Staff, Director)
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[A-Za-z]{2,})+$/,
        "Email không hợp lệ",
      ],
      required: false, // Email không bắt buộc, có thể cập nhật sau
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      default: "123456", // Mật khẩu mặc định
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
      unique: true, // SĐT là định danh duy nhất để đăng nhập
      trim: true,
      match: [/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"],
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: [
        "student",
        "teacher",
        "enrollment",
        "academic",
        "accountant",
        "director",
      ],
      required: [true, "Role là bắt buộc"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    isFirstLogin: {
      type: Boolean,
      default: true, // Đánh dấu đăng nhập lần đầu để bắt buộc đổi mật khẩu
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ phone: 1 }); // Đăng nhập bằng SĐT
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

module.exports = mongoose.model("User", userSchema);
