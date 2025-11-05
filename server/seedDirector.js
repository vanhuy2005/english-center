require("dotenv").config();
const mongoose = require("mongoose");
const Staff = require("./models/Staff");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const createDirector = async () => {
  try {
    // Kiểm tra xem đã tồn tại director chưa
    const existingDirector = await Staff.findOne({
      email: "director@englishcenter.com",
    });

    if (existingDirector) {
      console.log("✅ Tài khoản giám đốc đã tồn tại:");
      console.log("Email:", existingDirector.email);
      console.log("Mã Giám Đốc:", existingDirector.staffId);
      process.exit(0);
    }

    const directorData = {
      fullName: "Nguyễn Văn Director",
      email: "director@englishcenter.com",
      phone: "0123456789",
      password: "director123",
      gender: "Nam",
      dateOfBirth: new Date("1985-01-15"),
      address: "123 Đường ABC, TP.HCM",
      department: "Quản lý",
      position: "Giám Đốc",
      salary: 50000000,
      startDate: new Date("2020-01-01"),
      status: "Đang làm việc",
    };

    const director = new Staff(directorData);
    await director.save();

    console.log("✅ Tài khoản giám đốc đã được tạo thành công!");
    console.log("\n📋 Thông tin đăng nhập:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email: director@englishcenter.com");
    console.log("Mật khẩu: director123");
    console.log("Mã Giám Đốc:", director.staffId);
    console.log("Họ và tên:", director.fullName);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi tạo tài khoản:", error.message);
    process.exit(1);
  }
};

connectDB();
createDirector();
