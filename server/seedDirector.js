require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/shared/models/User.model");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const createDirector = async () => {
  try {
    // Kiểm tra xem đã tồn tại director chưa
    const existingDirector = await User.findOne({
      email: "director@englishcenter.com",
      role: "director",
    });

    if (existingDirector) {
      console.log("✅ Tài khoản giám đốc đã tồn tại:");
      console.log("Email:", existingDirector.email);
      console.log("Họ tên:", existingDirector.fullName);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      process.exit(0);
    }

    const directorData = {
      fullName: "Nguyễn Văn Giám Đốc",
      email: "director@englishcenter.com",
      phone: "0123456789",
      password: "director123", // Will be hashed by pre-save hook
      role: "director",
      status: "active",
    };

    const director = await User.create(directorData);

    console.log("✅ Tài khoản giám đốc đã được tạo thành công!");
    console.log("\n📋 Thông tin đăng nhập:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email: director@englishcenter.com");
    console.log("Mật khẩu: director123");
    console.log("Role: director");
    console.log("Họ và tên:", director.fullName);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi tạo tài khoản:", error.message);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await createDirector();
};

main();
